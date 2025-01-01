// config/fixedHolidays.js
const moment = require('moment');

const getFixedHolidays = () => {
    const currentYear = moment().year();
    return [
        { name: 'Fête de la Femme', date: `${currentYear}-08-13`, type: 'fix non payé', status: 'congé' },
        { name: 'Journée des Martyrs', date: `${currentYear}-04-09`, type: 'fix non payé', status: 'congé' },
    ];
};

module.exports = { getFixedHolidays };
