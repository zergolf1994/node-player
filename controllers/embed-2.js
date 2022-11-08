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
    if (!slug) return res.status(404).json({ status: false });

    let { analy_status, analy_realtime_status } = await SettingValue(true);

    let where_files = {},
      where_files_video = {},
      data = {};

    data.slug = slug;
    data.host = req.get("host");

    where_files.slug = slug;

    //player
    const player = await Player.findOne({
      attributes: ["active", "active_advert", "slug", "custom"],
      where: { domain: data.host, active: 1 },
    });
    if (!player) {
      data.title = `Invalid`;
      data.msg = "Invalid domain";
      return res.render("showError", data);
    }

    const FindFiles = await Files.findOne({ where: where_files });

    if (!FindFiles) {
      data.title = `Video not found`;
      data.msg = "Video not found";
      return res.render("showError", data);
    }

    //Statistics Created
    let statis_data = {};
    if (analy_status == 1) {
      statis_data = UserAgentData(req);
      statis_data.uid = FindFiles?.uid;
      statis_data.slug = FindFiles?.slug;
      statis_data.token = GenerateID(39);
      statis_data.player = data.host;
      statis_data.lastseenAt = new Date();
      await Statistic.create(statis_data);
    }

    // Save file_views
    let viewedAt = new Date().toISOString();
    await Files.update(
      { views: FindFiles?.views + 1, viewedAt },
      { where: { id: FindFiles?.id }, silent: true }
    );

    data.title = `${FindFiles?.title}`;
    data.slug = slug;
    data.statis_token =
      analy_status == 1 && analy_realtime_status == 1 ? statis_data?.token : "";
    return res.render("player", data);
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }
};
