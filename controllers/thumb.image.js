"use strict";

const Files = require("../modules/Mysql/Files");
const Storage = require("../modules/Mysql/Storage");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const { Sequelize, Op } = require("sequelize");
const http = require("http");
const fs = require("fs-extra");
const path = require("path");

module.exports = async (req, res) => {
  const { slug, sec } = req.params;
  const ext = req.params[0];

  let sv_id, sv_ip , w = 180;

  try {
    if (!slug) return res.status(404).end();

    let cachePath = path.join(global.dir, `image/${slug}/`)
    await fs.ensureDir(cachePath);

    if (fs.existsSync(`${cachePath}${sec},${w}`)) {
      // path exists
      let content = await fs.readFileSync(`${cachePath}${sec},${w}`);
      res.set("Cache-control", "public, max-age=31536000");
      res.set("Last-modified", "Sun, 31 Jul 2022 00:00:01 GMT");
      res.set("Content-type", `image/jpeg`);
      return res.status(200).end(content);
    } else {
      const videos = await FilesVideo.findAll({
        raw: true,
        attributes: ["token", "quality", "sv_id"],
        where: {
          slug,
          active: 1,
          sv_id: { [Op.ne]: 0 },
          quality: { [Op.ne]: 240 },
        },
      });

      if (!videos[0]) return res.status(404).end();
      sv_id = videos[0]?.sv_id;
      const FindStorage = await Storage.findOne({
        attributes: [`sv_ip`],
        where: { id: sv_id },
      });

      if (!FindStorage) return res.status(404).end();
      sv_ip = FindStorage?.sv_ip;

      const host = `http://${sv_ip}:8889/thumb/${videos[0]?.token}/file_${
        videos[0]?.quality
      }.mp4/thumb-${sec * 1000}-w${w}.jpg`;

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
          if (content != "null" || content != null) {
            //fs.writeFileSync(`${cachePath}${sec},${w}`, content, "utf8");
          }
          streamContent(content);
        });
      });

      
      const streamContent = function (content) {
        res.set("Cache-control", "public, max-age=31536000");
        res.set("Last-modified", "Sun, 31 Jul 2022 00:00:01 GMT");
        res.set("Content-type", `image/jpeg`);
        return res.status(200).end(content);
      };
    }
  } catch (error) {
    res.set("Content-type", `text/plain`);
    return res.end();
  }
};
