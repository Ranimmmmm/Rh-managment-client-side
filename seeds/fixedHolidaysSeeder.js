// seeds/fixedHolidaysSeeder.js
const { getFixedHolidays } = require('../config/fixedHolidaysnonPaied');
const PublicHoliday = require('../db');

const seedFixedHolidays = async () => {
    const fixedHolidays = getFixedHolidays();

    for (const holiday of fixedHolidays) {
        await PublicHoliday.findOrCreate({
            where: { name: holiday.name, date: holiday.date },
            defaults: holiday,
        });
    }

    console.log('Fixed holidays seeded successfully.');
};

module.exports = seedFixedHolidays;
