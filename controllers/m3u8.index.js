"use strict";

const request = require("request-promise");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Storage = require("../modules/Mysql/Storage");
const CacheM3u8 = require("../modules/Mysql/CacheM3u8");
const GroupDomain = require("../modules/Mysql/GroupDomain");
const { Sequelize, Op, json } = require("sequelize");
const http = require("http");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");

let sv_id, sv_ip, row, code_meta, domainList, setCache, cacheDir, cacheFile;

module.exports = async (req, res) => {
  const { token, quality } = req.params;
  const quality_allow = ["1080", "720", "480", "360", "240", "default"];

  try {
    if (!token || !quality) return res.status(404).end();

    if (!quality_allow.includes(quality)) return res.status(404).end();

    // find cache file json
    cacheDir = path.join(global.dir, `.cache/m3u8/index`);
    cacheFile = path.join(cacheDir, `${token}-${quality}.json`);

    if (fs.existsSync(`${cacheFile}`)) {
      //console.log("cache", true);
      //use cache
      let data = await fs.readFileSync(`${cacheFile}`);
      row = JSON.parse(data);
      let row_domain = await group_domain(row.gid);

      let gen = await genM3u8(row_domain.domain_list, row.meta_code);

      if (!gen) res.status(400).end();
      res.set("Cache-control", `public, max-age=60`);
      res.set("Content-type", `application/vnd.apple.mpegurl`);
      return res.status(200).end(gen);
    } else {
      //create cache
      //console.log("cache", false);
      //findCache
      let row = await genCache();

      if (!row) return res.status(400).end();

      let row_domain = await group_domain(row?.gid);
      let gen = await genM3u8(row_domain.domain_list, row.meta_code);

      if (!gen) res.status(400).end();
      res.set("Cache-control", `public, max-age=60`);
      res.set("Content-type", `application/vnd.apple.mpegurl`);
      return res.status(200).end(gen);
    }
  } catch (error) {
    //console.log(error);
    return res.status(404).end();
  }

  async function genCache() {
    const FindCache = await CacheM3u8.findOne({
      raw: true,
      where: { token: token, quality: quality },
    });
    await fs.ensureDir(cacheDir);

    if (!FindCache) {
      return await genCache2();
    } else {
      fs.writeFileSync(`${cacheFile}`, JSON.stringify(FindCache), "utf8");
      return FindCache;
    }
  }
  async function genCache2() {
    //console.log("genCache2", true);
    const FindVideo = await FilesVideo.findOne({
      where: { token: token, quality: quality },
    });
    if (!FindVideo) return res.status(404).end();

    sv_id = FindVideo?.sv_id;

    const FindStorage = await Storage.findOne({
      attributes: [`sv_ip`],
      where: { id: sv_id },
    });

    if (!FindStorage) return res.status(404).end();

    sv_ip = FindStorage?.sv_ip;
    const host = `http://${sv_ip}:8889/hls/${token}/file_${quality}.mp4/index.m3u8`;

    let result = await getRequest(host);
    if (!result) return;

    const array = [];
    let code = result;
    let html = code.split(/\r?\n/);
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
    insert.token = token;
    insert.sid = sv_id;
    insert.quality = quality;
    insert.meta_code = JSON.stringify(array);
    // check count
    const count = await CacheM3u8.count({
      where: { token: token, quality: quality },
    });

    if(count){
      return insert;
    }else{
      const save = await CacheM3u8.create(insert);
      return save;
    }
  }

  async function genM3u8(domain, code) {
    domain = domain.split(/\r?\n/);
    const data_meta = [];
    let start = 0,
      end = domain.length - 1;

    if (code) {
      code = JSON.parse(code);

      code.forEach((k, i) => {
        if (isNaN(k)) {
          if (!k.match(/EXT-X-MAP:URI=(.*?)-/gm)) {
            data_meta.push(k);
          }
        } else {
          var out = `//${domain[start]}/${token}/${quality}/${k}.html`;
          data_meta.push(out);
          if (start == end) {
            start = 0;
          } else {
            start++;
          }
        }
      });

      return data_meta.join(os.EOL);
    }

    return;
  }

  async function group_domain(gid = false) {
    let where = {},
      count;

    if (!gid) {
      where.type = "cloudflare";
      where.active = 1;
    } else {
      where.active = 1;
      where.id = gid;
    }

    count = await GroupDomain.count({ where });

    if (!count) {
      where.type = "stream";
      count = await GroupDomain.count({ where });
    }

    if (!count) return;

    let domain = await GroupDomain.findOne({
      raw: true,
      where,
      attributes: ["id", "type", "domain_list"],
      order: [["count_used", "ASC"]],
    });

    if (domain.type == "cloudflare" && !gid) {
      //update gid

      await CacheM3u8.update(
        { gid: domain?.id },
        {
          where: { token: token, quality: quality },
        }
      );
      await genCache();
    }

    return domain;
  }

  async function getRequest(url) {
    return new Promise(function (resolve, reject) {
      if (!url) resolve(false);
      http.get(url, function (resp) {
        if (resp?.statusCode != 200) {
          resolve(false);
        } else {
          const buffers = [];
          let length = 0;
          resp.on("data", function (chunk) {
            // store each block of data
            length += chunk.length;
            buffers.push(chunk);
          });
          resp.on("end", function () {
            const content = Buffer.concat(buffers);
            const buf = Buffer.from(content);

            resolve(buf.toString());
          });
        }
      });
    });
  }
};
