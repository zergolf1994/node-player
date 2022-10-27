"use strict";

const request = require("request-promise");
const fs = require("fs-extra");

module.exports = async (req, res) => {
  const { slug } = req.params;

  try {
    let cacheDir = "./vttdata",
      data;
    await fs.ensureDir(cacheDir);

    if (fs.existsSync(`${cacheDir}/${slug}_vtt`)) {
      // path exists
      data = await fs.readFileSync(`${cacheDir}/${slug}_vtt`, "utf8");
    } else {
      const host = `http://little-union-1972.zembed.workers.dev/${slug}.vtt`;
      data = await request(host);
      if (data != "null" || data != null) {
        fs.writeFileSync(`${cacheDir}/${slug}_vtt`, data);
      }
    }

    res.set("Content-type", `text/plain`);
    return res.end(data);
  } catch (error) {
    res.set("Content-type", `text/plain`);
    return res.end();
  }
};
