"use strict";

module.exports = async (req, res) => {
  const { slug } = req.params;
  try {
    if (!slug) return res.status(404).json({ status: false });

    let data = {};
    data.slug = slug;
    data.host = req.get("host");

    return res.render("demo", data);

    return res.status(200).json({ status: true, data });
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
