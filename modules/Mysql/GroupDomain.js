const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const GroupDomain = sequelize.define("groupdomain", {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.INTEGER(11),
    defaultValue: 0
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: ""
  },
  active: {
    type: DataTypes.INTEGER(1),
    defaultValue: 0
  },
  title: {
    type: DataTypes.STRING(255),
    defaultValue: 0
  },
  domain_list: {
    type: DataTypes.TEXT(),
    defaultValue: "",
  },
  count_used: {
    type: DataTypes.INTEGER(11),
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});

(async () => {
  await GroupDomain.sync({ force: false });
})();

module.exports = GroupDomain;
