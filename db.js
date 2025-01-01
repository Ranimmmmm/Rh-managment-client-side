const { Sequelize, DataTypes, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Database connection details
const sequelize = new Sequelize('employee', 'root', 'root123.', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: console.log, // Optional: Log SQL queries to console
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    },
});

const db = {};

// Read all model files in the models directory
fs.readdirSync(path.join(__dirname, 'models'))
    .filter(file => {
        return file.indexOf('.') !== 0 && file.slice(-3) === '.js';
    })
    .forEach(file => {
        const model = require(path.join(__dirname, 'models', file))(sequelize, DataTypes);
        db[model.name] = model;
    });

// If models have associations, execute them
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Define associations properly using db object
if (db.Employee && db.Activity && db.LeaveTransaction && db.PublicHoliday) {
    db.Employee.hasMany(db.Activity, { foreignKey: 'employeeId' });
    db.Activity.belongsTo(db.Employee, { foreignKey: 'employeeId' });
    db.Employee.hasMany(db.LeaveTransaction, { foreignKey: 'employeeId' });
    db.LeaveTransaction.belongsTo(db.Employee, { foreignKey: 'employeeId' });
    db.Activity.belongsTo(db.PublicHoliday, { foreignKey: 'publicHolidayId', as: 'holiday' });
    //db.PublicHoliday.hasMany(db.Activity, { foreignKey: 'publicHolidayId', as: 'activities' });
}

// Attach sequelize, Sequelize, and Op to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Op;



module.exports = db;
