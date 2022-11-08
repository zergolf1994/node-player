"use strict";
const Files = require("../modules/Mysql/Files");
const Player = require("../modules/Mysql/Players");
const Statistic = require("../modules/Mysql/Statistic");
const {
  UserAgentData,
  GenerateID,
  SettingValue,
} = require("../modules/Function");

module.exports = async (req, res) => {
  const { slug } = req.params;
  try {
    if (!slug) return res.status(404).end();
    const files = await Files.findOne({
      attributes: ["id", "uid", "title"],
      where: { slug: slug, active: 1 },
    });

    if (!files) {
      return res.status(404).end();
    }
    let { analy_status, analy_realtime_status } = await SettingValue(true);
    let statis = {},
      data = {};

    if (analy_status == 1) {
      statis = UserAgentData(req);
      statis.uid = files?.uid;
      statis.slug = slug;
      statis.token = GenerateID(39);
      statis.player = req.get("host");
      statis.lastseenAt = new Date();
      await Statistic.create(statis);
    }
    // Save file_views
    let viewedAt = new Date().toISOString();
    await Files.update(
      { views: files?.views + 1, viewedAt },
      { where: { id: files?.id }, silent: true }
    );

    data.title = `${files?.title}`;
    data.slug = slug;
    data.token =
      analy_status == 1 && analy_realtime_status == 1 ? statis?.token : "";

      
    res.set("Cache-control", `public, max-age=60`);
    return res.render("player", data);
  } catch (error) {
    console.log(error);
    return res.status(404).end();
  }
};
