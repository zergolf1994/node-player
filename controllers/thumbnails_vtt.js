"use strict";

const request = require("request-promise");
const fs = require("fs-extra");
const path = require("path");
const { SettingValue } = require("../modules/Function");

module.exports = async (req, res) => {
  const { slug } = req.params;
  let { domain_thumbnails } = await SettingValue(true);

  try {
    let cacheDir = path.join(global.dir, `.cache/vtt`),
      data;

    await fs.ensureDir(cacheDir);

    if (fs.existsSync(`${cacheDir}/${slug}_vtt`)) {
      // path exists
      data = await fs.readFileSync(`${cacheDir}/${slug}_vtt`, "utf8");
    } else {
      const host = `http://${domain_thumbnails}/${slug}.vtt`;
      data = await request(host);
      if (data != "null" || data != null) {
        fs.writeFileSync(`${cacheDir}/${slug}_vtt`, data);
      }
    }

    res.set("Content-type", `text/plain`);
    return res.end(data.replaceAll(`${slug}-`, `${slug}/`));
  } catch (error) {
    res.set("Content-type", `text/plain`);
    return res.end();
  }
};
