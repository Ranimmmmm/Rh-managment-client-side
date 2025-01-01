const { LeaveTransaction } = require('../db');


const getYearlySummaryLeaveByEmployeeId = async (req, res) => {
    const { employeeId, year } = req.params;
    if (!employeeId || !year) {
        return res.status(400).json({ error: 'Employee ID and year are required' });
    }

    try {

        const transactions = await LeaveTransaction.findAll({
            where: {
                employeeId: employeeId,
                year: year,
            },
            order: [['month', 'ASC']],
        });

        if (transactions.length === 0) {
            return res.status(404).json({ error: 'No transactions found for the specified year' });
        }

        // Initialize yearly summary calculations
        let totalPaidLeaveBalance = 0;
        let totalLeaveUsedPaid = 0;
        let totalLeaveUsedUnpaid = 0;
        let finalRemainingPaidLeave = 0;

        // Iterate through transactions to calculate yearly totals
        transactions.forEach(transaction => {
            totalPaidLeaveBalance += 1.83 || 0;
            totalLeaveUsedPaid += transaction.leaveUsedPaid || 0;
            totalLeaveUsedUnpaid += transaction.leaveUsedUnpaid || 0;
            finalRemainingPaidLeave = transaction.remainingPaidLeave || 0;
        });

        const yearlySummary = {
            employeeId: employeeId,
            year: year,
            totalPaidLeaveBalance,
            totalLeaveUsedPaid,
            totalLeaveUsedUnpaid,
            finalRemainingPaidLeave,
        };
        let monthlyBreakdown = [];
        transactions.forEach(transaction => {
         totalPaidLeaveBalance += 1.83 || 0;
         totalLeaveUsedPaid += transaction.leaveUsedPaid || 0;
         totalLeaveUsedUnpaid += transaction.leaveUsedUnpaid || 0;
         finalRemainingPaidLeave = transaction.remainingPaidLeave || 0;

        monthlyBreakdown.push({
         month: transaction.month,
         paidLeaveBalance: transaction.paidLeaveBalance,
         usedPaidLeave: transaction.leaveUsedPaid,
         usedUnpaidLeave: transaction.leaveUsedUnpaid,
         remainingPaidLeave: transaction.remainingPaidLeave
        });
     });
        res.json({
            yearlySummary,
            monthlyBreakdown
        });
    } catch (error) {
        console.error('Error retrieving yearly summary:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }


}

const getLeaveSummaryByDate = async (req, res) => { 
    const {employeeId , month, year } = req.params;
    if (!employeeId || !year || !month) {
        return res.status(400).json({ error: 'Employee ID and year are required' });
    }
    try {
        const transactions = await LeaveTransaction.findAll({
            where: {
                month: monthNumber,
                year: yearNumber,
            },
            order: [['month', 'ASC']],
        });
  
        if (transactions.length === 0) {
            return res.status(404).json({ error: 'No transactions found' });
        }
        console.log('***************' , transactions);
        res.json({ transactions });
    } catch (error) {
        console.error('Error retrieving monthly summary:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}


module.exports = {
    getYearlySummaryLeaveByEmployeeId,
    getLeaveSummaryByDate
};

