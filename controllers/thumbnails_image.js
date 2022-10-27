"use strict";

const request = require("request-promise");
const fs = require("fs-extra");
const http = require("http");

module.exports = async (req, res) => {
  const { slug , item } = req.params;

  try {
    let cacheDir = "./vttdata";

    await fs.ensureDir(cacheDir);

    const streamContent = function (content) {
      res.set("Cache-control", "public, max-age=31536000");
      res.set("Last-modified", "Sun, 31 Jul 2022 00:00:01 GMT");
      res.set("Content-type", `image/jpeg`);
      return res.status(200).end(content);
    };

    if (fs.existsSync(`${cacheDir}/${slug}_${item}_image`)) {
      let content = await fs.readFileSync(`${cacheDir}/${slug}_${item}_image`);
      streamContent(content);
    } else {
      const host = `http://little-union-1972.zembed.workers.dev/${slug}_${item}.jpg`;
      http.get(host, function (resp) {
        let buffers = [];
        let length = 0;
        resp.on("data", function (chunk) {
          // store each block of data
          length += chunk.length;
          buffers.push(chunk);
        });
        resp.on("end", function () {
          let content = Buffer.concat(buffers);
          fs.writeFileSync(`${cacheDir}/${slug}_${item}_image`, content, "utf8");
          streamContent(content);
        });
      });
    }

    //res.set("Content-type", `image/jpeg`);
    //res.set("Content-type", `text/plain`);
    //return res.end(data);
  } catch (error) {
    console.log(error);
    res.set("Content-type", `text/plain`);
    return res.end();
  }
};
