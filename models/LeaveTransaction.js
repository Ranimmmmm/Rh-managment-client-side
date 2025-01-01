const  db  = require('../db'); 
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const LeaveTransaction = sequelize.define('LeaveTransaction', {
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      paidLeaveBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 1.83,
      },
      leaveUsedPaid: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      leaveUsedUnpaid: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      remainingPaidLeave: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.83,
      },
      month: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      tableName: 'leave_transactions'
    });
    LeaveTransaction.beforeCreate(async (leaveTransaction, options) => {
      const { Employee, Activity } = sequelize.models;
  
      const employee = await Employee.findByPk(leaveTransaction.employeeId);
  
      if (!employee) {
        throw new Error('Employee not found');
      }

     const currentDate = new Date();
     const currentMonth = currentDate.getMonth() + 1; 
     const currentYear = currentDate.getFullYear();

      if (leaveTransaction.year == currentYear && leaveTransaction.month == 1) {
        leaveTransaction.paidLeaveBalance = 1.83;
        leaveTransaction.leaveUsedPaid = 0;
        leaveTransaction.leaveUsedUnpaid = 0;
      } else {

        const previousTransaction = await LeaveTransaction.findOne({
          where: {
            employeeId: leaveTransaction.employeeId,
            month: leaveTransaction.month - 1,
            year: currentYear,
          },
        });

        console.log('------------------------------------previousTransaction :',previousTransaction)
        if(previousTransaction){ leaveTransaction.paidLeaveBalance =
          previousTransaction.remainingPaidLeave + 1.83;}
          else {leaveTransaction.paidLeaveBalance = 1.83}
       

         
         // leaveTransaction.unpaidLeaveBalance = 0; 
      }

      const leaveUsedPaid = await Activity.sum('status', {
        where: {
          employeeId: leaveTransaction.employeeId,
          status: 'congé',
          actionDate: sequelize.where(
            sequelize.fn('MONTH', sequelize.col('actionDate')),
            currentMonth
          ),
        },
      });

      leaveTransaction.leaveUsedPaid = Math.min(
        leaveUsedPaid || 0,
        leaveTransaction.paidLeaveBalance
      );
      leaveTransaction.leaveUsedUnpaid = Math.max(
        (leaveUsedPaid || 0) - leaveTransaction.paidLeaveBalance,
        0
      );

      leaveTransaction.remainingPaidLeave =
      leaveTransaction.paidLeaveBalance - leaveTransaction.leaveUsedPaid;

    });

    LeaveTransaction.updateFutureBalances = async function (employeeId, updatedMonth, year) {
      const transactions = await this.findAll({
        where: {
          employeeId: employeeId,
          year: year,
          month: { [Op.gte]: updatedMonth }, 
        },
        order: [['month', 'ASC']],
      });
    
      if (transactions.length === 0) {
        console.log('No future transactions found to update.');
        return;
      }
    
      let remainingPaidLeave = null;
    
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
    
        // For the first record, calculate based on the updated remaining leave
        if (i === 0) {
          const previousTransaction = await this.findOne({
            where: {
              employeeId: employeeId,
              year: year,
              month: updatedMonth - 1,
            },
          });
    
          remainingPaidLeave = previousTransaction
            ? previousTransaction.remainingPaidLeave
            : 0;
        }
    
        const paidLeaveBalance = (remainingPaidLeave || 0) + 1.83; 
        const leaveUsedPaid = transaction.leaveUsedPaid || 0;
    
        remainingPaidLeave = paidLeaveBalance - leaveUsedPaid;
    
        await transaction.update({
          paidLeaveBalance: paidLeaveBalance,
          remainingPaidLeave: remainingPaidLeave,
        });
      }
    
      console.log('Future leave transactions updated successfully.');
    };

  
    return LeaveTransaction;
  };
  

  