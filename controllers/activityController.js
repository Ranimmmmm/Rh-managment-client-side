const express = require('express');
const { Activity, Employee, LeaveTransaction, Sequelize } = require('../db');
const moment = require('moment');
const { Op } = require('sequelize');
const { sequelize } = require('../db');



exports.getemployeesActivityByDate = async (req, res) => {
    const { date } = req.query;
    
    if (!date) {
        return res.status(400).send({ error: 'Date parameter is required.' });
    }

    const startDate = moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment(date).endOf('day').format('YYYY-MM-DD ');

    try {
        const employees = await Employee.findAll({
            include: [{
                model: Activity,
                where: { actionDate: { [Op.between]: [startDate, endDate] } },
                required: false
            }]
        });
        res.json(employees);
    } catch (error) {
        console.error('Failed to retrieve employees and their activities:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.saveActivity = async(req, res)=>{
    const { employeeId, inTime, outTime, status, numberOfMissions, actionDate } = req.body;

    const formattedActionDate = moment(actionDate, true).isValid()
    ? moment(actionDate).format('YYYY-MM-DD')
    : null;

    if (!formattedActionDate) {
     console.error("Invalid actionDate provided:", actionDate);
     return res.status(400).json({ error: 'Invalid actionDate format' });
    }

    const transactionMonth  = moment(actionDate).month() + 1; 
    const transactionYear  = moment(actionDate).year();

    try {
        let activity = await Activity.findOne({
            where: { employeeId: employeeId, actionDate: formattedActionDate }
        });

        let newActivity; 

        if (activity) {
            await activity.update({
                inTime: inTime,
                outTime: outTime,
                status: status,
                numberOfMissions: numberOfMissions,
                updatedAt: new Date()
            });
            
        } else {
            const formattedActionDate = moment(actionDate).format('YYYY-MM-DD HH:mm:ss');
            newActivity = await Activity.create({
                employeeId: employeeId,
                inTime: inTime,
                outTime: outTime,
                status: status,
                numberOfMissions: numberOfMissions,
                actionDate: formattedActionDate,
                createdAt: new Date(),
                updatedAt: new Date()
            });}

            let leaveTransaction = await LeaveTransaction.findOne({
                where: { employeeId: employeeId, month: transactionMonth, year: transactionYear }
            });
            if (status === "congé" && type === 'fix non payé') {
                await leaveTransaction.update({
                    leaveUsedPaid: sequelize.literal('leaveUsedPaid +1'),
                }, {where: {employeeId: employeeId},});
            }
            if (!leaveTransaction) {
                leaveTransaction = await LeaveTransaction.create({
                    employeeId: employeeId,
                    date: formattedActionDate,
                    month: transactionMonth,
                    year: transactionYear,
                });
            }

            const leaveUsedPaid = await Activity.count( {
                where: {
                    employeeId: employeeId,
                    status: 'congé',
                    actionDate: sequelize.where(
                        sequelize.fn('MONTH', sequelize.col('actionDate')),
                        transactionMonth
                    ),
                },
            }) || 0;
    
            const updatedLeaveUsedPaid = Math.min(leaveUsedPaid, leaveTransaction.paidLeaveBalance);
            const updatedLeaveUsedUnpaid = Math.max(leaveUsedPaid - leaveTransaction.paidLeaveBalance, 0);
            const updatedRemainingPaidLeave = leaveTransaction.paidLeaveBalance - updatedLeaveUsedPaid;
            console.log('****************paidleavebalance', leaveTransaction.paidLeaveBalance)
            await leaveTransaction.update({
                leaveUsedPaid: updatedLeaveUsedPaid,
                leaveUsedUnpaid: updatedLeaveUsedUnpaid,
                remainingPaidLeave: updatedRemainingPaidLeave,
            });

            await LeaveTransaction.updateFutureBalances(employeeId, transactionMonth, transactionYear);

            res.json({
                newActivity,
                leaveTransaction,
            });
            console.log("********************", newActivity);
            console.log("********************", leaveTransaction);

    } catch ( error) {
        console.error('Failed to save or update activity:', error);
        res.status(500).send({ error: 'Internal Server Error', message: error.message });
    }
}

exports.getEmployeesActivityByEmployeeId = async (req, res) => {
    const { employeeId, year, month } = req.params;

    // Calculate the start and end dates for the specified month
    const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();

    try {
        // Fetch all activities for the employee in the specified month
        const activities = await Activity.findAll({
            where: {
                employeeId: employeeId,
                updatedAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: ['updatedAt', 'status'] ,
            order: [['updatedAt', 'DESC']]
        });

        // Group activities by date, taking only the latest update per day
        const latestActivitiesByDay = activities.reduce((acc, activity) => {
            const day = moment(activity.updatedAt).format('YYYY-MM-DD');
            if (!acc[day]) {
                acc[day] = {
                    date: day,
                    status: activity.status,
                    inTime: activity.inTime,
                    outTime: activity.outTime,
                    numberOfMissions: activity.numberOfMissions,
                    updatedAt: activity.updatedAt,
                };
            }
            return acc;
        }, {});

        // Generate full month with placeholders for missing days
        const daysInMonth = moment(endDate).date();
        const activitiesByDayArray = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = moment(`${year}-${month}-${day}`).format('YYYY-MM-DD');
            if (latestActivitiesByDay[date]) {
                activitiesByDayArray.push(latestActivitiesByDay[date]);
            } else {
                activitiesByDayArray.push({
                    date,
                    status: 'No activity',
                    inTime: '--',
                    outTime: '--',
                    numberOfMissions: 0,
                });
            }
        }

        res.json(activitiesByDayArray);
    } catch (error) {
        console.error('Failed to retrieve activities grouped by day:', error); // Log the error message
        res.status(500).send({ error: 'Internal Server Error' });
    }
} 

exports.getAllActivities = async (req, res) => {
    const { months, years, employeeId, statuses } = req.query;

    const whereClause = {};

    // Filter by months and years
    if (months && years) {
        const monthArray = months.split(","); // Allow multiple months (e.g., "01,02,03")
        const yearArray = years.split(",");   // Allow multiple years (e.g., "2023,2024")

        const dateRanges = [];

        for (const year of yearArray) {
            for (const month of monthArray) {
                const startDate = moment(`${year}-${month}-01`, "YYYY-MM-DD").startOf('month').toDate();
                const endDate = moment(startDate).endOf('month').toDate();
                dateRanges.push({ [Op.between]: [startDate, endDate] });
            }
        }

        whereClause.actionDate = { [Op.or]: dateRanges };
    }

    // Filter by employeeId
    if (employeeId) {
        whereClause.employeeId = employeeId;
    }

    try {
        const activities = await Activity.findAll({
            where: whereClause,
            order: [['actionDate', 'DESC']],
        });

        res.json(activities);
    } catch (error) {
        console.error('Failed to retrieve activities:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}
