// models/Employee.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Adjust the path as necessary
module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define('Employee', {
        prenom: {
            type: DataTypes.STRING,
            allowNull: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numerodetel: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fonction: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profile_image: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        files: {
            type: DataTypes.JSON, 
            allowNull: true,
        },
        startMonth: {
            type: DataTypes.INTEGER,
            allowNull: true
        }

    }, {
        tableName: 'employees',
        modelName: 'Employee'
    });
    return Employee;
};

