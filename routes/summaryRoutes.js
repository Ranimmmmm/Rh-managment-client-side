const express = require('express');
const router = express.Router();
const leaveTransactionController = require('../controllers/LeaveController');

router.get('/yearly-summary/:employeeId/:year', leaveTransactionController.getYearlySummaryLeaveByEmployeeId);

router.get('/monthly-summary/:employeeId/month/:year', leaveTransactionController.getLeaveSummaryByDate);

module.exports = router;
