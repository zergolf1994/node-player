"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
global.dir = __dirname;
require("dotenv").config();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

let corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.options("*", (req, res, next) => res.end());
app.use(require("./routes"));
require("http").createServer(app).listen(80);
