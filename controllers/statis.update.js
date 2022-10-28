"use strict";

const Statistic = require("../modules/Mysql/Statistic");

module.exports = async (req, res) => {
  const { token, lastseenAt } = req.body;

  try {
    if (!token || !lastseenAt) return res.end();
    //update
    let data = {};

    data.lastseenAt = lastseenAt;

    let update = await Statistic.update(data, {
      where: { token: token },
    });
    return res.end();
  } catch (error) {
    return res.end();
  }
};
