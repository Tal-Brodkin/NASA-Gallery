'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UsersTable.init({
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        is: /^[A-Za-z0-9 ]{3,32}$/i
      }},

    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        is: /^[A-Za-z0-9 ]{3,32}$/i
      }},

    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isEmail: true
      }},

    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }},

  }, {
    sequelize,
    modelName: 'UsersTable',
  });
  return UsersTable;
};