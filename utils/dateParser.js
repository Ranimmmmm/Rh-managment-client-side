// utils/dateParser.js
const moment = require('moment');

function parseDate(inputDate) {
    const date = moment(inputDate, 'YYYY-MM-DD', true);
    if (!date.isValid()) {
        throw new Error('Invalid date format');
    }
    return date.format();
}

module.exports = parseDate;
