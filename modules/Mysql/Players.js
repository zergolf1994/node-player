const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Players = sequelize.define('players', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    active: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    active_advert: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    uid: {
      type: DataTypes.INTEGER(11),
    },
    domain: {
      type: DataTypes.STRING(255),
    },
    custom: {
      type: DataTypes.TEXT('long'),
    },
    advert: {
      type: DataTypes.TEXT('long'),
    },
    api_key: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    slug: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
  
  (async () => {
    await Players.sync({ force: false });
  })();
  
  module.exports = Players;