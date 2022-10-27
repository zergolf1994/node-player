"use strict";
const Files = require("../modules/Mysql/Files");
const Player = require("../modules/Mysql/Players");

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

    
    //player
    const player = await Player.findOne({
      attributes: ["active", "active_advert", "slug", "custom"],
      where: { domain: data.host, active: 1 },
    });
    if (!player){
      data.title = `Invalid`;
      data.msg = "Invalid domain";
      return res.render("showError", data);
    }

    const FindFiles = await Files.findOne({ where: where_files });
    
    if (!FindFiles) {
      data.title = `Video not found`;
      data.msg = "Video not found";
      return res.render("showError", data);
    }else{
      data.title = `${FindFiles?.title} - Video Player`;
      data.slug = slug;
      return res.render("player", data);
    }

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.log(error)
    return res.json({ status: false, msg: error.name });
  }
};
