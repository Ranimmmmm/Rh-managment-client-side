const express = require('express');
const router = express.Router();
const uploader = require('../middlewares/multer');
const employeeController = require('../controllers/employee.controller');



router.get('/all', employeeController.getAllEmployee);

router.get('/:id', employeeController.getEmployeeById);

router.post('/', uploader.upload, employeeController.createEmployee);

router.put('/:id', uploader.upload, employeeController.updateEmployee);

router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
