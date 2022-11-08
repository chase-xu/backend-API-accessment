const Sequelize = require('sequelize');

const db = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: process.env.DATABASE_FILE
    ? process.env.DATABASE_FILE
    : 'database.db',
  logging: false,
});

// const queryInterface = db.getQueryInterface();
// queryInterface.addColumn('post', 'authorIds', {type: Sequelize.STRING});

module.exports = db;
