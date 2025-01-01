// scripts/debugDate.js
const moment = require('moment');

const inputDate = '2024-12-21';
const date = moment(inputDate, 'YYYY-MM-DD', true);

if (!date.isValid()) {
    console.error('Invalid date format!');
} else {
    console.log('Parsed date:', date.format());
}
