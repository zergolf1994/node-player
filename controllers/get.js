"use strict";

const Files = require("../modules/Mysql/Files");
const FilesThumb = require("../modules/Mysql/FilesThumb");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Player = require("../modules/Mysql/Players");
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  const { slug } = req.body;
  const host = req.get("host");
  try {
    if (!slug) return res.status(404).json({ status: false });
    //player
    const player = await Player.findOne({
      attributes: ["active", "active_advert", "slug", "custom"],
      where: { domain: host, active: 1 },
    });
    if (!player) return res.status(200).json({ status: false });
    let video = {};

    if (player?.active_advert) {
      video.advert = `//${host}/vast/${player.slug}.xml`;
    }
    //file
    const file = await Files.findOne({
      attributes: ["active", "title", "status", "uid"],
      where: { slug },
    });
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
    let tracks = {};
    if (videos.length == 1) {
      video.image = `//${host}/thumb/${videos[0]?.token}/${videos[0]?.quality}.jpg`;
      video.file = `//${host}/index/${videos[0]?.token}/${videos[0]?.quality}`;
      video.fileType = `hls`;
      //tracks.file = `//${host}/thumbnails/${slug}.vtt`;
      //tracks.kind = `thumbnails`;
    } else if (videos.length > 1) {
      video.image = `//${host}/thumb/${videos[0]?.token}/${videos[0]?.quality}.jpg`;
      video.file = `//${host}/master/${slug}`;
      video.fileType = `hls`;
      //tracks.file = `//${host}/thumbnails/${slug}.vtt`;
      //tracks.kind = `thumbnails`;
    } else {
      //update status
      if (file?.status > 2) {
        let data_update = {};
        const fv = await FilesVideo.findAll({
          raw: true,
          where: {
            slug,
            active: 1,
          },
        });

        if (fv.length > 0) {
          let q = [],
            d = [];
          fv.forEach((el) => {
            if (!q.includes(el.quality)) {
              q.push(el.quality);
            } else {
              d.push(el.id);
            }
          });
          if (q.length > 1) {
            data_update.status = 4;
          } else {
            data_update.status = 2;
          }

          if (d.length > 0) {
            await FilesVideo.destroy({ where: { id: d } });
            //console.log("delete", d);
          }
        }
        //console.log("data_update", data_update);
        await Files.update(data_update, {
          where: { slug },
        });
      }

      video.file = `//${host}/processing.mp4`;
      video.fileType = `mp4`;
    }

    const thumbs = await FilesThumb.findAll({
      raw: true,
      attributes: ["type"],
      where: { slug: slug },
    });

    if (thumbs[0]) {
      tracks.file = `//${host}/thumbnails/${slug}.vtt`;
      tracks.kind = `thumbnails`;
    }

    return res.status(200).json({ status: true, video, file, player, tracks });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }
};
