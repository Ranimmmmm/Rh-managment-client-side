const { PublicHoliday, Activity } = require('../db');
const dotenv = require('dotenv');
dotenv.config();
const moment = require('moment');
const { Op } = require('sequelize');
const { checkAndMarkHolidaysForNextWeek } = require('../utils/holidaySchedulerUtils');
const {createHolidayActivities} = require ('../services/createHolidayActivities ');
// Create a public holiday
/* exports.createHoliday = async (req, res) => {
    const { name, date, numberOfDays, isVariable } = req.body;

    try {
        const holiday = await PublicHoliday.create({ name, date, numberOfDays, isVariable });
        console.log("************",holiday);
        res.status(201).json(holiday);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; */

// Read all public holidays
/* exports.getAllHolidays = async (req, res) => {
    try {
        const holidays = await PublicHoliday.findAll();
        res.json(holidays);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; */


// refer to cron 
exports.getcheckHoliday = async (req, res) => {
    try {
        const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

        const holidays = await PublicHoliday.findAll({
            where: { date: { [Op.eq]: tomorrow } },
        });

        if (holidays.length > 0) {
            for (const holiday of holidays) {
                await createHolidayActivities(holiday.date, 'férié'); // Assign activities for the holiday
            }

            res.status(200).send({ message: 'Holiday activities updated successfully.' });
        } else {
            res.status(200).send({ message: 'No holidays for tomorrow.' });
        }
    } catch (error) {
        console.error('Error updating holiday activities:', error);
        res.status(500).send({ error: 'Failed to update holiday activities.' });
    }
};


/*  exports.checkHoliday = async (req, res) => {
  try {
      await checkAndMarkHolidaysForNextWeek();
      res.status(200).send({ message: 'Holiday check for next week completed successfully.' });
  } catch (error) {
      res.status(500).send({ error: 'Failed to check and update holidays.' });
  }
};

exports.createDefaultHolidays = async (req, res) => {
  try {
      const currentYear = moment().year();
      const defaultHolidays = [
          { date: `${currentYear}-08-13`, status: 'congé' },
          { date: `${currentYear}-04-09`, status: 'congé' },
      ];

      for (const holiday of defaultHolidays) {
          await createHolidayActivities(holiday.date, holiday.status);
      }

      res.status(200).send({ message: `Default holidays for ${currentYear} created successfully.` });
  } catch (error) {
      res.status(500).send({ error: 'Failed to create default holidays.' });
  }
};  */

/* exports.createDefaultHolidays = async (req, res) => {
    try {
        const currentYear = moment().year();
        const { name, date, numberOfDays, type, status } = req.body;

        const defaultHolidays = [
            { name: 'Fête de la Femme  ', date: `${currentYear}-08-13`, type: 'fix', status: 'congé' },
            { name: 'Journée des Martyrs ', date: `${currentYear}-04-09`, type: 'fix', status: 'congé' },
        ];

        for (const holiday of defaultHolidays) {
            // Save each holiday
            const createdHoliday = await PublicHoliday.create(holiday);

            // Add the holiday as an activity for all employees
            await createHolidayActivities(holiday.date, holiday.status);
        }

        res.status(200).send({ message: `Default holidays for ${currentYear} created successfully.` });
    } catch (error) {
        res.status(500).send({ error: 'Failed to create default holidays.' });
    }
}; */
exports.assignFixedHolidayStatus = async (req, res) => {
    try {
        const currentYear = moment().year();

        // Predefined fixed holidays
        const fixedHolidays = [
            { name: 'Fête de la Femme', date: `${currentYear}-08-13`, type: 'fix non payé', status: 'congé' },
            { name: 'Journée des Martyrs', date: `${currentYear}-04-09`, type: 'fix non payé', status: 'congé' },
        ];

        for (const holiday of fixedHolidays) {
            // Create holiday in the database
            await PublicHoliday.create(holiday);

            // Assign "congé" status to employees for fixed holidays
            if (holiday.status === 'congé') {
                await createHolidayActivities(holiday.date, holiday.status);
            }
        }

        res.status(200).send({ message: 'Fixed holidays processed and statuses assigned successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to assign statuses for fixed holidays.' });
    }
};

// Create a holiday
exports.createHoliday = async (req, res) => {
    const { name, date, numberOfDays, type, status } = req.body;

    try {
        // Save the holiday
        const holiday = await PublicHoliday.create({ name, date, numberOfDays, type, status });

        // If the holiday is marked as "férie" or "congé", assign it to employees
        if (status === 'férie' || status === 'congé') {
            await createHolidayActivities(date, status);
        }

        res.status(201).json(holiday);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHolidaysByYear = async (req, res) => {
  const { year } = req.params;

  try {
      const holidays = await PublicHoliday.findAll({
          where: {
              date: {
                  [Op.between]: [`${year}-01-01`, `${year}-12-31`],
              },
          },
      });

      res.status(200).json(holidays);
  } catch (error) {
      console.error('Error fetching holidays by year:', error.message);
      res.status(500).json({ error: 'Failed to fetch holidays for the year.' });
  }
};
exports.getFilteredHolidays = async (req, res) => {
    try {
        const { status, type } = req.query;

        // Build the query dynamically
        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;

        const holidays = await PublicHoliday.findAll({ where });

        res.status(200).json(holidays);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch holidays.' });
    }
};
// Update a public holiday
exports.updateHoliday = async (req, res) => {
    const { id } = req.params;
    const { name, date, numberOfDays, isVariable } = req.body;

    try {
        const holiday = await PublicHoliday.findByPk(id);
        if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

        await holiday.update({ name, date, numberOfDays, isVariable });
        res.json(holiday);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a public holiday
exports.deleteHoliday = async (req, res) => {
    const { id } = req.params;

    try {
        const holiday = await PublicHoliday.findByPk(id);
        if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

        await holiday.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
