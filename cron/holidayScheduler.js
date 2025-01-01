const cron = require('node-cron');
const { checkAndMarkHolidaysForNextWeek, createHolidayActivities } = require('../utils/holidaySchedulerUtils');

// Schedule 1: Runs every Sunday at 08:00 AM to check for holidays in the next week
cron.schedule('0 8 * * 0', async () => { 
    console.log('Cron job for checking holidays started...');
    try {
        await checkAndMarkHolidaysForNextWeek();
        console.log('Holiday check for next week completed successfully.');
    } catch (error) {
        console.error('Error running holiday scheduler:', error.message);
    }
});

// Schedule 2: Runs at midnight on January 1st to create default holidays
cron.schedule('0 0 1 1 *', async () => {
    try {
        const currentYear = moment().year();
        const defaultHolidays = [
            { date: `${currentYear}-08-13`, status: 'congé' },
            { date: `${currentYear}-04-09`, status: 'congé' },
        ];

        for (const holiday of holidays) {
            await createHolidayActivities(holiday.date, holiday.status);
        }

        console.log(`Default holidays for ${currentYear} have been successfully created.`);
    } catch (error) {
        console.error('Error creating default holidays:', error.message);
    }
});

