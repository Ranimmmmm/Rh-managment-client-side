const express = require('express');
const router = express.Router();
const publicHolidayController = require('../controllers/publicHolidayController');

// Create a public holiday
//router.post('/', publicHolidayController.createHoliday);

// Get all public holidays
/* router.get('/', publicHolidayController.getAllHolidays);
 */
// Update a public holiday
router.put('/:id', publicHolidayController.updateHoliday);

// Delete a public holiday
router.delete('/:id', publicHolidayController.deleteHoliday);

//check for holidays 
/*  router.get('/check-holiday', publicHolidayController.checkHoliday); */

router.post('/', publicHolidayController.createHoliday);


// Populate Fixed holidays Non paied for the year
router.get('/holidays', publicHolidayController.getFilteredHolidays);

router.get('/:year', publicHolidayController.getHolidaysByYear);
module.exports = router;
