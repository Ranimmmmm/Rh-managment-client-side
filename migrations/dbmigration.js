'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('leave_transactions', 'month', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('leave_transactions', 'year', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('leave_transactions', 'month');
    await queryInterface.removeColumn('leave_transactions', 'year');
  }
};
