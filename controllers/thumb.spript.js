"use strict";

const request = require("request-promise");
const http = require("http");
const fs = require("fs-extra");
const path = require("path");
const Files = require("../modules/Mysql/Files");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Storage = require("../modules/Mysql/Storage");
const moment = require("moment");
const { Sequelize, Op } = require("sequelize");
const mergeImg = require("merge-img");
const sizeOf = require("image-size");

module.exports = async (req, res) => {
  const { slug } = req.params;
  let duration = 0,
    invStart_Image = 1,
    invStart = 1,
    interval = 1,
    totalImages = 0,
    totalSpirits = 1,
    rowCount = 10,
    colCount = 5,
    table = [],
    width = 180,
    height = 84,
    cachePath;

  let sv_id, sv_ip , token , quality , w = 180;

  try {
    if (!slug) return res.status(404).end();

    const file = await Files.findOne({
      attributes: ["duration"],
      where: { slug },
    });

    if (!file) return res.status(404).end();
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
    token=videos[0]?.token;
    quality=videos[0]?.quality;

    const FindStorage = await Storage.findOne({
      attributes: [`sv_ip`],
      where: { id: sv_id },
    });

    if (!FindStorage) return res.status(404).end();
    sv_ip = FindStorage?.sv_ip;

    cachePath = path.join(global.dir, `public/${slug}/`);

    duration = file?.duration;
    interval = await getOptimalInterval();
    totalImages = Math.floor(duration / interval);
    totalSpirits = Math.ceil(duration / interval / (rowCount * colCount));
    const startTime = moment("00:00:00", "HH:mm:ss.SSS");
    const endTime = moment("00:00:00", "HH:mm:ss.SSS").add(interval, "seconds");
    //get image interval
     for (let inv = 0; inv < totalImages; inv++) {
      await getThumbs(invStart_Image);
      invStart_Image += interval;
    }

    await getThumbsSize();
    //set table and vtt
    let i_break = false;

    let thumbOutput = "WEBVTT\n\n";

    for (let k = 0; k < totalSpirits; k++) {
      let img = [],
        lineX = [];
      for (let i = 0; i < rowCount; i++) {
        let lineY = [];

        for (let j = 0; j < colCount; j++) {
          const currentImageCount = k * rowCount * colCount + i * colCount + j;
          if (currentImageCount >= totalImages) {
            i_break = true;
            break;
          }

          thumbOutput += `${startTime.format(
            "HH:mm:ss.SSS"
          )} --> ${endTime.format("HH:mm:ss.SSS")}\n`;
          thumbOutput += `${slug}/${k + 1 < 10 ? "0" : ""}${k + 1}.jpg#xywh=${
            j * width
          },${i * height},${width},${height}\n\n`;

          startTime.add(interval, "seconds");
          endTime.add(interval, "seconds");

          lineY.push(invStart);
          invStart += interval;
        }

        lineX.push(lineY);
        if (i_break) {
          break;
        }
      }
      table[k] = lineX;
    }

    //create spript x
    let i = 0,
      o = 0,
      links = [];
    for (const items of table) {
      let linkX = [];
      o = 0;
      for (const item of items) {
        let link = await createThumbs(table[i][o],i,o);
        linkX.push(`${slug}/_${i}_${o}.jpg`);
        o++;
      }
      i++;
      links.push(linkX);
    }

    //create spript y
    let li = 0;
    for (const link of links) {
      li++;
      let out = await createFinal(link, li);
    }

    //vtt create
    
    fs.writeFileSync(path.join(cachePath, `${slug}.vtt`), thumbOutput);

    return res.end(thumbOutput);
  } catch (error) {
    console.log(error);
    res.set("Content-type", `text/plain`);
    return res.end();
  }

  function getOptimalInterval() {
    if (duration < 120) return 1;
    if (duration < 300) return 2;
    if (duration < 600) return 3;
    if (duration < 1800) return 4;
    if (duration < 3600) return 5;
    if (duration < 7200) return 10;
    return 10;
  }

  //download thumbs
  async function getThumbs(sec) {
    //let host = `http://localhost/thumbnails/${slug}/${sec}.jpg`;
    const host = `http://${sv_ip}:8889/thumb/${token}/file_${quality}.mp4/thumb-${sec * 1000}-w${w}.jpg`;
    let cachePath = path.join(global.dir, `public/${slug}/`);
    await fs.ensureDir(cachePath);

    return new Promise(function (resolve, reject) {
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
            fs.writeFileSync(`${cachePath}${sec}.jpg`, content, "utf8");
          }
          resolve(content);
        });
      });
    });
  }
  async function getThumbsSize() {
    let imgPath = path.join(cachePath, `1.jpg`);
    const dimensions = sizeOf(imgPath);
    return new Promise(function (resolve, reject) {
      width = dimensions?.width;
      height = dimensions?.height;
      resolve(true);
    });
  }
  async function createThumbs(images, i, ia) {
    let aa = [];
    return new Promise(function (resolve, reject) {
      images.map((img) => {
        let cachePath = path.join(global.dir, `public/${slug}/${img}.jpg`);
        aa.push(cachePath);
      });
      if (aa.length != colCount) {
        let count = colCount - aa.length;

        for (let index = 0; index < count; index++) {
          aa.push(aa[index]);
        }
      }
      mergeImg(aa, { direction: false }).then((img) => {
        img.write(
          path.join(global.dir, `public/${slug}/_${i}_${ia}.jpg`),
          () => {
            resolve(path.join(global.dir, `public/${slug}/_${i}_${ia}.jpg`));
          }
        );
      });
    });
  }

  async function createFinal(images, i) {
    let bb = [];
    return new Promise(function (resolve, reject) {
      images.map((img) => {
        let cachePath = path.join(global.dir, `public/${img}`);
        bb.push(cachePath);
      });
      mergeImg(bb, { direction: true }).then((img) => {
        img.write(
          path.join(global.dir, `public/${slug}/${slug}_${i < 10 ? "0" : ""}${i}.jpg`),
          () => {
            resolve(
              path.join(
                global.dir,
                `public/${slug}/${slug}_${i < 10 ? "0" : ""}${i}.jpg`
              )
            );
          }
        );
      });
    });
  }
};
