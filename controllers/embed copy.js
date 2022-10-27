"use strict";

const Files = require("../modules/Mysql/Files");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  const { slug } = req.params;
  try {
    if (!slug) return res.status(404).json({ status: false });

    let where_files = {},
      where_files_video = {},
      data = {};

    data.slug = slug;
    data.host = req.get("host");

    where_files.slug = slug;
    const FindFiles = await Files.findOne({ where: where_files });
    if (!FindFiles) {
      data.title = `Video not found`;
      data.msg = "Video not found";
      return res.render("showError", data);
    }

    data.title = `${FindFiles?.title} - Video Player`;

    if (FindFiles?.status == 0 || FindFiles?.status == 1) {
      data.msg = "Video is Processing";
      return res.render("showError", data);
    }

    where_files_video.slug = slug;
    where_files_video.sv_id = { [Op.ne]: 0 };
    const FindVideo = await FilesVideo.findAll({ where: where_files_video });
    if (!FindVideo.length) {
      data.msg = "Video is Processing";
      return res.render("showError", data);
    }

    if (FindVideo.length > 1) {
    } else {
      let token = FindVideo[0]?.token;
      let quality = FindVideo[0]?.quality;
      data.image = `//${data.host}/thumb/${token}/${quality}.jpg`;
      data.file_m3u8 = `//${data.host}/index/${token}/${quality}`;
      console.log(data)
      return res.render("jwhls", data);
    }

    return res.status(200).json({ status: true, data });
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
