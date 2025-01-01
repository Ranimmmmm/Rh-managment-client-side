const { PublicHoliday, Activity, Employee } = require('../db');
const moment = require('moment');
const { Op } = require('sequelize');

/**
 * Check for public holidays for next week's Monday-Friday
 * and update employees' activity to "férié" for those dates.
 */
const checkAndMarkHolidaysForNextWeek = async () => {
    try {
        const nextMonday = moment().startOf('week').add(1, 'week').add(1, 'days').format('YYYY-MM-DD');
        const nextFriday = moment(nextMonday).add(4, 'days').format('YYYY-MM-DD');

        console.log('Checking for holidays between:', nextMonday, 'and', nextFriday);

        const holidays = await PublicHoliday.findAll({
            where: { date: { [Op.between]: [nextMonday, nextFriday] } },
        });

        console.log('Holidays found:', holidays);

        if (holidays.length > 0) {
            const employees = await Employee.findAll();
            console.log('Employees fetched:', employees);

            const activities = holidays.flatMap(holiday => 
                employees.map(employee => ({
                    employeeId: employee.id,
                    status: 'férié',
                    actionDate: holiday.date,
                    publicHolidayId: holiday.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }))
            );

            console.log('Activities to be created:', activities);

            await Activity.bulkCreate(activities, { ignoreDuplicates: true });

            console.log(`Holidays set for employees on these dates: ${holidays.map(h => h.date).join(', ')}`);
        } else {
            console.log('No holidays for next week (Monday to Friday).');
        }
    } catch (error) {
        console.error('Error checking and marking holidays for next week:', error);
    }
};

const createHolidayActivities = async (date, status) => {
    try {
        const employees = await Employee.findAll();
        const activities = employees.map(employee => ({
            employeeId: employee.id,
            status: status,
            actionDate: date,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await Activity.bulkCreate(activities, { ignoreDuplicates: true });

        console.log(`Activities created for holiday on ${date} with status: ${status}`);
    } catch (error) {
        console.error(`Failed to create holiday activities for ${date}:`, error);
        throw error;
    }
};

module.exports = { checkAndMarkHolidaysForNextWeek, createHolidayActivities };
