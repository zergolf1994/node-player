"use strict";
const e = require("express");
const Player = require("../modules/Mysql/Players");

module.exports = async (req, res) => {
  const { slug } = req.params;

  try {
    const ad = await Player.findOne({
      attributes: ["active_advert", "advert"],
      where: { slug: slug },
    });
    const data = {
      data: JSON.parse(ad.advert),
    };
    res.type("xml");
    return res.render("vast", data);
  } catch {
    return res.status(404).end();
  }
};
