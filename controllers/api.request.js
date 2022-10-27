"use strict";

const path = require("path");
const fs = require("fs");
const request = require("request-promise");
const http = require("http");
const File = require("../modules/Mysql/Files");
const Player = require("../modules/Mysql/Players");
const Servers = require("../modules/Mysql/Servers");
const { Sequelize, Op } = require("sequelize");

const {
  SourceAllow,
  GenerateID,
  ExistsLinks,
  gdriveInfo,
} = require("../modules/Function");

module.exports = async (req, res) => {
  const { title, token, source } = req.body;
  let uid,
    domain,
    data = {},
    sv_ip,
    insert = {},
    server;

  const host = req.get("host");

  try {
    if (!token || !source) return res.json({ status: false });

    // check token
    const player = await Player.findOne({
      attributes: ["uid", "active", "domain"],
      where: { api_key: token },
    });

    if (!player) return res.json({ status: false, msg: "Invalid token." });

    if (player?.domain != host)
      return res.json({ status: false, msg: `This domain ${host} is not allowed.` });

    if (!player?.active)
      return res.json({ status: false, msg: "The player is disabled." });

    //check source allow
    let allow = await SourceAllow(source);

    if (!allow?.allow) return res.json({ status: true, msg: "Invalid source" });
    uid = player?.uid;
    domain = player?.domain;
    //Check ExistsLinks
    const file = await ExistsLinks(allow?.type, allow?.source);
    
    if (file?.status)
      return res.json({
        status: "success",
        cache: true,
        embed_url: `https://${domain}/embed/${file?.row?.slug}`,
      });

    if (allow?.type == "direct") {
      //check http
      let statusCode = await httpStatus(allow?.source);

      if (statusCode != 200)
        return res.json({
          status: false,
          msg: "The source cannot be accessed.",
        });

      //insert data
      data.title = title || allow?.title;
      data.mimetype = "video/mp4";
    } else if (allow?.type == "gdrive") {
      server = await Servers.findOne({
        where: { active: 1, type: "download" },
        attributes: ["sv_ip"],
        order: [[Sequelize.literal("RAND()")]],
        raw: true,
      });

      if (!server?.sv_ip)
        return res.json({ status: false, msg: "no server download" });

      sv_ip = server?.sv_ip;

      let gid = allow?.gid;

      const g = await getRequest(`http://${sv_ip}:8888/gdrive/info?gid=${gid}`);

      if (!g?.status) return res.json({ status: false });

      data.title = g?.data?.Name;
      data.mimetype = g?.data?.Mime;
    }

    if (data) {
      data.uid = uid;
      data.type = allow?.type;
      data.source = allow?.source;
      data.slug = GenerateID(15);

      //insert to db
      insert = await File.create(data);
    }

    if (insert?.id) {
      if (sv_ip) {
        await getRequest(`http://${sv_ip}:8888/run`);
      }
      return res.json({
        status: "success",
        cache: false,
        embed_url: `https://${domain}/embed/${data?.slug}`,
      });
    } else {
      return res.json({ status: false });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error });
  }
};

async function getRequest(host) {
  let result = await request(host);
  return new Promise(function (resolve, reject) {
    resolve(JSON.parse(result));
  });
}

async function httpStatus(host) {
  return new Promise(function (resolve, reject) {
    http.get(host, function (response) {
      resolve(response.statusCode);
    });
  });
}
