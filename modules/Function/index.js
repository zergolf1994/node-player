"use strict";
const request = require("request");
const queryString = require("query-string");
const User = require("../Mysql/Users");
const Files = require("../Mysql/Files");
const UserSettings = require("../Mysql/Users.settings");
const Settings = require("../Mysql/Settings");
const GroupDomain = require("../Mysql/GroupDomain");
const parser = require("ua-parser-js");
const os = require("os");
const http = require("http");

exports.SettingValue = async (e) => {
  let data = [];
  try {
    const result = await Settings.findAll({
      raw: true,
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    });
    return new Promise(function (resolve, reject) {
      if (e) {
        for (var key in result) {
          let name = result[key].name;
          let value = result[key].value;
          data[name] = value;
        }
        resolve(data);
      } else {
        resolve(result);
      }
    });
  } catch (error) {
    data["status"] = false;
    data["msg"] = error.message;
    return data;
  }
};
exports.UserAgentData = (req) => {
  let data = {};
  data.client_ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

  const ua = parser(req.headers["user-agent"]);

  data.os_name = ua?.os?.name;
  data.os_version = ua?.os?.version;
  data.bs_name = ua?.browser?.name;
  data.bs_version = ua?.browser?.version;
  data.bs_major = ua?.browser?.major;
  data.user_agent = ua?.ua;
  data.referer = req.headers.referer || "";

  return data;
};

exports.ExistsUsersName = async (username) => {
  let data = {};
  try {
    const result = await User.findOne({ where: { username: username } });
    if (result) {
      //has users
      data.status = true;
      data.result = result;
    } else {
      data.status = false;
      data.msg = "not found";
    }
  } catch (error) {
    data.status = false;
    data.msg = error.message;
  }
  return data;
};
exports.ExistsEmail = async (email) => {
  let data = {};
  try {
    const result = await User.findOne({ where: { email: email } });
    if (result) {
      //has users
      data.status = true;
      data.result = result;
    } else {
      data.status = false;
      data.msg = "not found";
    }
  } catch (error) {
    data.status = false;
    data.msg = error.message;
  }
  return data;
};
exports.ExistsDir = async (title, uid) => {
  let data = {};
  try {
    const result = await Files.findOne({
      where: { title: title, type: "0f", uid: uid },
    });
    if (result) {
      data.status = true;
      data.result = result;
    } else {
      data.status = false;
      data.msg = "not found";
    }
  } catch (error) {
    data.status = false;
    data.msg = error.message;
  }
  return data;
};

exports.ExistsLinks = async (type, source) => {
  let data = {};

  try {
    const result = await Files.findOne({
      raw: true,
      where: { type: type, source: source },
    });
    if (result) {
      data = { status: true, row: result };
      //data.result = result;
    } else {
      data.status = false;
      data.msg = "not found";
    }
  } catch (error) {
    data.status = false;
    data.error = true;
    data.msg = error.message;
  }
  return data;
};
exports.FindDir = async (slug) => {
  let data = {};
  try {
    const result = await Files.findOne({ where: { type: "0f", slug: slug } });
    if (result) {
      data.status = true;
      data.result = result;
    } else {
      data.status = false;
      data.msg = "not found";
    }
  } catch (error) {
    data.status = false;
    data.msg = error.message;
  }
  return data;
};
exports.UserAgent = () => {
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36";
};

exports.GenerateID = (
  length = 6,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
) => {
  var result = "";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.getPagination = (page, totalItem, limitItem = 10) => {
  const currentPage = page ? page : 1;
  const totalPages = Math.ceil(totalItem / limitItem);

  const start_rows = currentPage == 1 ? 0 : (currentPage - 1) * limitItem;
  const end_rows = limitItem;
  return { totalPages, start_rows, end_rows };
};

exports.SourceAllow = async (source) => {
  const matchGoogleDrive =
    /(?:https?:\/\/)?(?:[\w\-]+\.)*(?:drive|docs)\.google\.com\/(?:(?:folderview|open|uc)\?(?:[\w\-\%]+=[\w\-\%]*&)*id=|(?:folder|file|document|presentation)\/d\/|spreadsheet\/ccc\?(?:[\w\-\%]+=[\w\-\%]*&)*key=)([\w\-]{28,})/i;
  const matchMP4 = /([\w\-]{1,200})\.(mp4)$/i;
  const setData = {};
  setData.allow = true;

  if (matchGoogleDrive.test(source)) {
    const match = source.match(matchGoogleDrive);
    setData.gid = match[1];
    setData.type = "gdrive";
    setData.source = `${match[1]}`;
  } else if (matchMP4.test(source)) {
    const match = source.match(matchMP4);
    setData.title = match[1];
    setData.type = "direct";
    setData.source = source;
  } else {
    setData.allow = false;
  }
  return setData;
};

exports.getDatagDrive = async (gid) => {
  const data = {};
  const url = `https://docs.google.com/get_video_info?docid=${gid}`;

  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const parsed = queryString.parse(response.body);
        if (parsed?.title) {
          data.title = parsed?.title;
        }
        if (parsed?.public) {
          data.public = parsed?.public;
        }
        resolve(data);
      } else {
        reject();
      }
    });
  });
};
exports.Domain = async (gid = false) => {
  let where = {},
    gdm;
  if (gid) {
    where.id = gid;
  }

  where.type = "cloudflare";
  where.active = 1;

  gdm = await GroupDomain.findOne({
    attributes: ["id", "domain_list", "type", "count_used"],
    where,
    order: [["count_used", "ASC"]],
  });

  if (!gdm) {
    delete where.id;
    where.type = "stream";
    gdm = await GroupDomain.findOne({
      attributes: ["id", "domain_list", "type", "count_used"],
      where,
    });
  }

  if (!gdm?.domain_list) {
    return false;
  }
  gdm.domain = gdm?.domain_list.split(/\r?\n/);

  return gdm;
};

exports.getRequest = async (url) => {
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
};
