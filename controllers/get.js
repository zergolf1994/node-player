"use strict";

const Files = require("../modules/Mysql/Files");
const FilesThumb = require("../modules/Mysql/FilesThumb");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Player = require("../modules/Mysql/Players");
const Statistic = require("../modules/Mysql/Statistic");
const {
  UserAgentData,
  GenerateID,
  SettingValue,
} = require("../modules/Function");
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  const { slug } = req.body;
  const host = req.get("host");

  try {
    if (!slug) return res.status(404).json({ status: false });
    //player
    const players = await Player.findOne({
      attributes: ["uid", "active", "active_advert", "slug", "custom"],
      where: { domain: host, active: 1 },
    });

    if (!players)
      return res.status(200).json({ status: false, msg: "invalid_domain" });

    let player = {};

    player.custom = players?.custom;

    if (players?.active_advert) {
      player.advert = `//${host}/vast/${players.slug}.xml`;
    }
    //file
    let where = { slug: slug };
    //if (players?.uid && players?.uid != 1) where.uid = players?.uid;

    const file = await Files.findOne({
      attributes: ["active", "title", "status", "uid"],
      where,
    });

    if (!file)
      return res.status(200).json({ status: false, msg: "invalid_video" });

    //videos
    const videos = await FilesVideo.findAll({
      raw: true,
      attributes: ["token", "quality"],
      where: {
        slug,
        active: 1,
        sv_id: { [Op.ne]: 0 },
        token: { [Op.ne]: "" },
      },
    });

    let tracks = {},
      thumbnails = true,
      video = {};

    if (videos.length == 1) {
      video.image = `//${host}/thumb/${videos[0]?.token}/${videos[0]?.quality}.jpg`;
      video.file = `//${host}/index/${videos[0]?.token}`;
      video.fileType = `hls`;
    } else if (videos.length > 1) {
      video.image = `//${host}/thumb/${videos[0]?.token}/${videos[0]?.quality}.jpg`;
      video.file = `//${host}/master/${slug}`;
      video.fileType = `hls`;
    } else {
      //update status
      video.file = `//${host}/processing.mp4`;
      video.image = `//${host}/novideo.jpg`;
      video.fileType = `mp4`;
      thumbnails = false;
    }

    if (thumbnails) {
      const thumbs = await FilesThumb.findAll({
        raw: true,
        attributes: ["type"],
        where: { slug: slug },
      });

      if (thumbs[0]) {
        tracks.file = `//${host}/thumbnails/${slug}.vtt`;
        tracks.kind = `thumbnails`;
      }
    }

    return res.status(200).json({
      status: true,
      video,
      player,
      tracks,
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: "video_error" });
  }
};
