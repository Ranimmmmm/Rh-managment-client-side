const { Employee } = require('../db');
const dotenv = require('dotenv');
dotenv.config();


const getAllEmployee = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).send({ error: "Internal Server Error", message: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).send('Employee not found');
    }
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).send({ error: "Internal Server Error", message: err.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { prenom, nom, email, numerodetel, fonction } = req.body;

    const profileImage = req.files?.['profile_image']
    ? `${process.env.BASE_URL}/images/profiles/${req.files['profile_image'][0].filename}`
    : `https://ui-avatars.com/api/?name=${prenom}&background=2F4F4F&color=fff&size=128`;
  

    const filesArray = req.files['files']
      ? req.files['files'].map(file => `${process.env.BASE_URL}/profiles/${file.filename}`)
      : [];


    if (!prenom || !nom || !email || !numerodetel || !fonction) {
      return res.status(400).json({
        message: 'All fields are required',
        success: false,
      });
    }

    const emp = new Employee({
      prenom,
      nom,
      email,
      numerodetel,
      fonction,
      profile_image: profileImage,
      files: filesArray,
    });


    await emp.save();
    res.status(201).json({
      message: 'Employee Created',
      success: true,
      id: emp.save.id,
      prenom: emp.save.prenom,
      nom: emp.save.nom,
      email: emp.save.email,
      profile_image: emp.save.profile_image,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      message: 'Internal Server Error',
      success: false,
      error: err.message || err,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { prenom, nom, email, numerodetel, fonction } = req.body;

    // Extract files from the request
    const profileImage = req.files?.['profile_image']
      ? req.files['profile_image'][0].filename
      : null;

    const filesArray = req.files?.['files']
      ? req.files['files'].map(file => `${process.env.BASE_URL}/files/${file.filename}`)
      : null;

    // Fetch the employee record
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
        success: false,
      });
    }

    // Prepare updated fields
    const updatedData = {
      prenom: prenom || employee.prenom,
      nom: nom || employee.nom,
      email: email || employee.email,
      numerodetel: numerodetel || employee.numerodetel,
      fonction: fonction || employee.fonction,
      profile_image: profileImage
        ? `${process.env.BASE_URL}/profiles/${profileImage}`
        : employee.profile_image,
      files: filesArray || employee.files,
    };

    // Update the employee record
    const updatedEmployee = await employee.update(updatedData);

    res.json({
      message: 'Employee updated successfully',
      success: true,
      data: updatedEmployee,
    }); 
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};


const deleteEmployee = async (req, res) => {
  try {
    const numDeleted = await Employee.destroy({
      where: { id: req.params.id }
    });
    if (numDeleted) {
      res.status(204).send();
    } else {
      res.status(404).send('Employee not found');
    }
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).send({ error: "Internal Server Error", message: err.message });
  }
};


module.exports = {
  getAllEmployee,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
