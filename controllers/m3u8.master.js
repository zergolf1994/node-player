"use strict";

const request = require("request-promise");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Storage = require("../modules/Mysql/Storage");
const CacheM3u8 = require("../modules/Mysql/CacheM3u8");
const GroupDomain = require("../modules/Mysql/GroupDomain");
const { Sequelize, Op, json } = require("sequelize");
const http = require("http");
const os = require("os");

module.exports = async (req, res) => {
  const { slug } = req.params;
  const host = req.get("host");

  try {
    if (!slug) return res.status(404).json({ status: false });

    let order_by = "quality",
      order_sort = "ASC";
    //videos
    const videos = await FilesVideo.findAll({
      raw: true,
      attributes: ["token", "quality", "mimesize", "filesize"],
      where: { slug, active: 1, sv_id: { [Op.ne]: 0 }, quality: { [Op.ne]: 240 } },
      order: [[order_by, order_sort]],
    });

    let extm3u = `#EXTM3U` + os.EOL;
    for (var key in videos) {
      let { token, quality, mimesize, filesize } = videos[key];
      if (quality != 240) {
        extm3u +=
          `#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${filesize},RESOLUTION=${mimesize}` +
          os.EOL;
        extm3u += `//${host}/index/${token}/${quality}` + os.EOL + os.EOL;
      }
    }
    res.set("Content-type", `application/vnd.apple.mpegurl`);
    return res.end(extm3u);
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }
};

function sum(a) {
  return a + 1;
}
