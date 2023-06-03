'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostsTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostsTable.init({
    postId: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      }},

    lastTimeModified: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true,
      }},

  }, {
    sequelize,
    modelName: 'PostsTable',
  });
  return PostsTable;
};