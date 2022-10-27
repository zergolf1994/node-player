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
  const { token, quality } = req.params;
  const quality_allow = ["1080", "720", "480", "360", "240", "default"];

  try {
    if (!token || !quality) return res.status(404).json({ status: false });

    if (!quality_allow.includes(quality))
      return res.status(404).json({ status: false });

    let sv_id, sv_ip, code_meta, domainList , setCache;
    //check data cache
    const FindCache = await CacheM3u8.findOne({
      where: { token: token, quality: quality },
    });

    if (!FindCache) {
      const FindVideo = await FilesVideo.findOne({
        where: { token: token, quality: quality },
      });
      if (!FindVideo) return res.status(404).json({ status: false });

      sv_id = FindVideo?.sv_id;

      const FindStorage = await Storage.findOne({
        attributes: [`sv_ip`],
        where: { id: sv_id },
      });
      if (!FindStorage) return res.status(404).json({ status: false });
      sv_ip = FindStorage?.sv_ip;

      const host = `http://${sv_ip}:8889/hls/${token}/file_${quality}.mp4/index.m3u8`;
      let result = await request(host);
      if (!result) return res.status(404).json({ status: false });
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
      insert.sid = sv_id;
      insert.token = token;
      insert.quality = quality;
      insert.meta_code = JSON.stringify(array);

      const FindGroup = await GroupDomain.findOne({
        where: { type: "cloudflare", active: 1 },
        order: [["count_used", "ASC"]],
      });
      if (FindGroup?.id) {
        insert.gid = FindGroup?.id;
        domainList = FindGroup?.domain_list;
        setCache = 3600;
      }

      const save = await CacheM3u8.create(insert);

      if (save && FindGroup?.id) {
        let nowC = FindGroup?.count_used + 1;
        const Groupupdate = { count_used: nowC };
        const updateGroupA = await GroupDomain.update(Groupupdate, {
          where: { id: insert.gid },
        });
      }
      code_meta = array;
    } else {
      code_meta = JSON.parse(FindCache?.meta_code);

      if (FindCache?.gid) {
        const FindGroup = await GroupDomain.findOne({
          where: { type: "cloudflare", active: 1, id: FindCache.gid },
        });

        if (FindGroup?.id) {
          domainList = FindGroup?.domain_list;
          setCache = 3600;
        }
      }else{
        const FindGroup = await GroupDomain.findOne({
          where: { type: "cloudflare", active: 1 },
          order: [["count_used", "ASC"]],
        });
        if(FindGroup?.id){
          await CacheM3u8.update({gid: FindGroup.id}, {
            where: { id: FindCache?.id }
          });
          await GroupDomain.update({count_used: (FindGroup.count_used+1)}, {
            where: { id: FindGroup.id }
          });
          domainList = FindGroup?.domain_list;
          setCache = 3600;
        }
      }
    }

    if (!domainList) {
      let fdm = {},
        count,
        findDmlist;
      fdm.active = 1;
      fdm.type = "stream";

      count = await GroupDomain.count({ where: fdm });

      if (!count) {
        return res.status(403).end();
      }
      findDmlist = await GroupDomain.findOne({
        where: fdm,
        order: [["count_used", "ASC"]],
      });

      if(findDmlist){
        domainList = findDmlist?.domain_list
        setCache = 600;
      }
    }

    domainList = domainList.split(/\r?\n/);
    if (code_meta) {
      const data_meta = [];
      let start = 0,
        end = domainList.length - 1;

      code_meta.forEach((k, i) => {
        if (isNaN(k)) {
          //it's a number
          //data_meta.push(k);
          if(!k.match(/EXT-X-MAP:URI=(.*?)-/gm)){
            data_meta.push(k);
          }
        } else {
          var out = `//${domainList[start]}/${token}/${quality}/${k}.html`;
          data_meta.push(out);
          if (start == end) {
            start = 0;
          } else {
            start++;
          }
        }
      });
      /*
        Set cache Files
      */
      /*if(setCache){
        res.set("Cache-control", `public, max-age=${setCache}`);
      }*/
      res.set("Content-type", `application/vnd.apple.mpegurl`);
      return res.end(data_meta.join(os.EOL));
    } else {
      return res.status(404).end();
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }
};
