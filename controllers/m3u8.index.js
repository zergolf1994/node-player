"use strict";

const request = require("request-promise");
const Files = require("../modules/Mysql/Files");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Backup = require("../modules/Mysql/Backup");
const Storage = require("../modules/Mysql/Storage");
const CacheM3u8 = require("../modules/Mysql/CacheM3u8");
const GroupDomain = require("../modules/Mysql/GroupDomain");
const { Sequelize, Op, json } = require("sequelize");
const http = require("http");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const { Domain, getRequest, httpStatus } = require("../modules/Function");

let cacheDir, cacheFile;

module.exports = async (req, res) => {
  const { token } = req.params;
  let quality, m3u8, slug;
  try {
    if (!token) return res.status(404).end("404_4");

    // find cache file json
    cacheDir = path.join(global.dir, `.cache/m3u8/index`);
    cacheFile = path.join(cacheDir, `${token}-${quality}.json`);
    if (fs.existsSync(`${cacheFile}`)) {
      let data = await fs.readFileSync(`${cacheFile}`);
      m3u8 = JSON.parse(data);
      console.log("cache", token);
    } else {
      m3u8 = await CacheM3u8.findOne({
        raw: true,
        attributes: ["sid", "gid", "meta_code", "quality"],
        where: { token: token, type: "index" },
      });

      if (!m3u8) {
        m3u8 = await GenNewCache();
        if (!m3u8) {
          return res.status(404).end("not_video_convert");
        }
      }
      await fs.ensureDir(cacheDir);
      fs.writeFileSync(`${cacheFile}`, JSON.stringify(m3u8), "utf8");
      console.log("generate", token);
    }

    let where = {};
    let { id, domain, type, count_used } = await Domain(m3u8?.gid);
    if (!domain.length) return res.status(404).end("not_domain_lists");

    quality = m3u8?.quality;

    if (!m3u8.gid) {
      await CacheM3u8.update(
        { gid: id },
        {
          where: { token: token },
        }
      );
      await GroupDomain.update(
        { count_used: count_used + 1 },
        {
          where: { id: id },
        }
      );
    }

    let code = await GenM3u8Index(domain, m3u8?.meta_code);
    if (!code) return res.status(404).end("error_lists");
    res.set("Cache-control", `public, max-age=60`);
    res.set("Content-type", `application/vnd.apple.mpegurl`);
    return res.status(200).end(code);
  } catch (error) {
    console.log(error);
    return res.status(404).end("404_1");
  }

  async function GenM3u8Index(domain, data) {
    if (data) {
      const code = [];
      let start = 0,
        end = domain.length - 1;

      data = JSON.parse(data);

      data.forEach((k, i) => {
        if (isNaN(k)) {
          if (!k.match(/EXT-X-MAP:URI=(.*?)-/gm)) {
            code.push(k);
          }
        } else {
          var out = `//${domain[start]}/${token}/${quality}/${k}.html`;
          code.push(out);
          if (start == end) {
            start = 0;
          } else {
            start++;
          }
        }
      });
      return code.join(os.EOL);
    }
    return;
  }
  async function GenNewCache() {
    const vdo = await FilesVideo.findOne({
      where: { token: token, active: 1 },
    });

    if (!vdo) return;
    slug = vdo?.slug;
    const storage = await Storage.findOne({
      attributes: [`sv_ip`],
      where: { id: vdo?.sv_id },
    });
    const host_files = `http://${storage?.sv_ip}:8888/files/list?token=${token}`;

    let files_list = await getRequest(host_files);
    files_list = JSON.parse(files_list).data.files[0];

    if (!files_list) return;

    const host = `http://${storage?.sv_ip}:8889/hls/${token}/${files_list}/index.m3u8`;

    let sCode = await httpStatus(host);
    console.log(sCode);
    if (sCode == 404) {
      //delete file_video
      await FilesVideo.destroy({ where: { slug: slug } });
      //delete file backup
      await Backup.destroy({ where: { slug: slug } });
      //update files to wait
      await Files.update(
        { status: 0 },
        {
          where: { slug: slug },
        }
      );
      console.log("error", slug);
      return;
    }

    let result = await getRequest(host);
    if (!result) return;

    const array = [];
    let html = result.split(/\r?\n/);
    var regex = /seg-(.*?)-/gm;
    await html.forEach((k, i) => {
      if (k.match(regex)) {
        var nameitem = k.match(regex);
        var numitem = nameitem
          .toString()
          .replace("seg-", "")
          .replace("-", "")
          .replace(".ts", "")
          .replace("-v1", "")
          .replace("-a1", "");
        array.push(numitem);
      } else {
        if (k) {
          array.push(k.trim());
        }
      }
    });
    //create cache in mysql
    const insert = {};
    insert.type = "index";
    insert.token = vdo?.token;
    insert.sid = vdo?.sv_id;
    insert.quality = vdo?.quality;
    insert.meta_code = JSON.stringify(array);

    // check count
    const count = await CacheM3u8.count({
      where: { token: vdo?.token, quality: vdo?.quality },
    });
    if (count) {
      return insert;
    } else {
      const save = await CacheM3u8.create(insert);
      return save;
    }
  }
};
