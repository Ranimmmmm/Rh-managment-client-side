// controllers/dateController.js
const moment = require('moment');

exports.parseDate = (req, res) => {
    const inputDate = req.body.date || '2024-12-21'; // Assuming date comes from request body

    const date = moment(inputDate, 'YYYY-MM-DD', true);
    if (!date.isValid()) {
        return res.status(400).json({ error: 'Invalid date format!' });
    }

    return res.status(200).json({ parsedDate: date.format() });
};
