'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CommentsTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CommentsTable.init({

    userName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }},

    postId: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }},

    commentId: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }},

    comment: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }},
  }, {
    sequelize,
    modelName: 'CommentsTable',
  });
  return CommentsTable;
};