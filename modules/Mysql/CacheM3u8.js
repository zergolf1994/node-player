const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const CacheM3u8 = sequelize.define('cachem3u8', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    gid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    sid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    token: {
      type: DataTypes.STRING(50),
    },
    quality: {
      type: DataTypes.STRING(50),
    },
    meta_code: {
      type: DataTypes.TEXT('long'),
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
  
  (async () => {
    await CacheM3u8.sync({ force: false });
  })();
  
  module.exports = CacheM3u8;