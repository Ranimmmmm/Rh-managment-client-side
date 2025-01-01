const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController')

router.get('/getbyDate', activityController.getemployeesActivityByDate);

router.post('/save', activityController.saveActivity);

router.get('/employee/:employeeId/:year/:month', activityController.getEmployeesActivityByEmployeeId);

router.get('/', activityController.getAllActivities);
module.exports = router;
