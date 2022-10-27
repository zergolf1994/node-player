"use strict";
const express = require("express");
const router = express.Router();
const moment = require("moment");

router.all("/", (req, res) => res.status(404).end(""));

router.get("/demo/:slug", require("./controllers/demo"));
router.get("/embed/:slug", require("./controllers/embed"));
router.get("/index/:token/:quality", require("./controllers/m3u8.index"));
router.get("/master/:slug", require("./controllers/m3u8.master"));
router.get("/thumb/:token/:quality.(jpg|png)", require("./controllers/thumb"));
router.get("/thumbnails/:slug.(vtt)", require("./controllers/thumbnails_vtt"));
router.get(
  "/thumbnails/:slug/:item.(jpg|png)",
  require("./controllers/thumbnails_image")
);
router.get("/spript/:slug", require("./controllers/thumb.spript"));
router.get("/vast/:slug.xml", require("./controllers/vast"));
router.post("/api/get", require("./controllers/get"));

//api
router.post("/api/request", require("./controllers/api.request"));

router.all("*", function (req, res) {
  res.status(404).json({ status: false, msg: "page not found" });
});
module.exports = router;
