"use strict";

const request = require("request-promise");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Files = require("../modules/Mysql/Files");
const Storage = require("../modules/Mysql/Storage");
const { Sequelize, Op } = require("sequelize");
const http = require("http");
const os = require("os");

module.exports = async (req, res) => {
  const { token, quality } = req.params;
  const ext = req.params[0];
  const quality_allow = ["1080", "720", "480", "360", "240", "default"];

  try {
    if (!token || !quality) return res.status(404).json({ status: false });

    if (!quality_allow.includes(quality))
      return res.status(404).json({ status: false });

    const FindVideo = await FilesVideo.findOne({
      where: { token: token, quality: quality },
    });
    if (!FindVideo) return res.status(404).json({ status: false });

    let sv_id, sv_ip, duration, slug;

    sv_id = FindVideo?.sv_id;
    slug = FindVideo?.slug;

    const FindStorage = await Storage.findOne({
      attributes: [`sv_ip`],
      where: { id: sv_id },
    });
    if (!FindStorage) return res.status(404).json({ status: false });
    sv_ip = FindStorage?.sv_ip;

    const FindFiles = await Files.findOne({
      attributes: [`duration`],
      where: { slug: slug },
    });

    duration = FindFiles?.duration || 0;

    if (!duration) {
      duration = 1 * 1000;
    } else {
      duration = (duration / 2).toFixed(0);
      duration = duration * 1000;
    }

    const host = `http://${sv_ip}:8889/thumb/${token}/file_${quality}.mp4/thumb-${duration}-w400.jpg`;

    http.get(host, function (resp) {
      var buffers = [];
      var length = 0;
      resp.on("data", function (chunk) {
        // store each block of data
        length += chunk.length;
        buffers.push(chunk);
      });
      resp.on("end", function () {
        var content = Buffer.concat(buffers);
        save_content(content);
      });
    });

    var save_content = function (content) {
      res.set("Cache-control", "public, max-age=31536000");
      res.set("Last-modified", "Sun, 31 Jul 2022 00:00:01 GMT");
      res.set("Content-type", `image/${ext}`);
      return res.end(content);
    };
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }
};
