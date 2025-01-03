const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import the database connection

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensures email is unique in the database
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'customer', // Default role is 'customer'
    allowNull: false,
  },
});

// Export the model to be used in other files
module.exports = User;
