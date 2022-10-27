"use strict";

const Files = require("../modules/Mysql/Files");
const moment = require("moment");
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  const { slug } = req.params;
  let duration = 0,
  interval = 1
  try {
    if (!slug) return res.status(404).end();
    
    const file = await Files.findOne({
      attributes: ["duration"],
      where: { slug },
    });

    if (!file) return res.status(404).end();

    duration = file?.duration

    console.log("WEBVTT generation started");
    let thumbOutput = "WEBVTT\n\n";
    const startTime = moment("00:00:00", "HH:mm:ss.SSS");
    const endTime = moment("00:00:00", "HH:mm:ss.SSS").add(interval, "seconds");
    const totalImages = Math.floor(duration / interval);

    for (let j = 1; j <= totalImages; j++) {
      
      thumbOutput += `${startTime.format("HH:mm:ss.SSS")} --> ${endTime.format("HH:mm:ss.SSS")}\n`;
      thumbOutput += `${slug}/${j}.jpg\n\n`;

      startTime.add(interval, "seconds");
      endTime.add(interval, "seconds");
    }

    res.set("Content-type", `text/plain`);
    return res.end(thumbOutput);
  } catch (error) {
    res.set("Content-type", `text/plain`);
    return res.end();
  }
};
