const  db  = require('../db'); 
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const PublicHoliday = sequelize.define('PublicHoliday', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY, // Specific date for the holiday
            allowNull: false,
        },
        numberOfDays: {
            type: DataTypes.INTEGER, // Number of days the holiday lasts
            defaultValue: 1,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('fix payé', 'fix non payé', 'variable payé'),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING, // Examples: 'férié', 'congé'
            allowNull: false,
        },
    }, {
        tableName: 'public_holidays',
        modelName: 'PublicHoliday',
    });
    return PublicHoliday;
};
