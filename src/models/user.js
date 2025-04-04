const { DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize-config');

const User = sequelize.define('User', {
  // Model attributes
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  // Other model options
  tableName: 'Users', // Specify the actual table name
  timestamps: true    // Adds createdAt and updatedAt timestamps
});

module.exports = User;