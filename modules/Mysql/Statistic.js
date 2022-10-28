const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Statistics = sequelize.define(
  "statistics",
  {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    slug: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    player: {
      type: DataTypes.STRING(255),
    },
    referer: {
      type: DataTypes.STRING(255),
    },
    token: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    os_name: {
      type: DataTypes.STRING(255),
    },
    os_version: {
      type: DataTypes.STRING(255),
    },
    bs_name: {
      type: DataTypes.STRING(255),
    },
    bs_version: {
      type: DataTypes.STRING(255),
    },
    bs_major: {
      type: DataTypes.STRING(255),
    },
    client_ip: {
      type: DataTypes.STRING(255),
    },
    user_agent: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    lastseenAt: {
      type: DataTypes.DATE,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["uid"],
      },
      {
        unique: false,
        fields: ["slug"],
      },
      {
        unique: false,
        fields: ["player"],
      },
      {
        unique: false,
        fields: ["referer"],
      },
      {
        unique: false,
        fields: ["token"],
      },
    ],
  }
);

(async () => {
  await Statistics.sync({ force: false });
})();

module.exports = Statistics;
