const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Request = require("../models/request");
const User = require("../models/user");
const Item = require("../models/item");
const UserAuthCheck = require("./auth");
const adminAuthCheck = require("./adminAuth");
const Response = require("../models/response");
const userAuthCheck = require("./auth");
const router = express.Router();

const emailRegexp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  let errors = [];
  if (!email) {
    errors.push({ message: "Email required" });
  }
  if (!emailRegexp.test(email)) {
    errors.push({ message: "invalid email" });
  }
  if (!password) {
    errors.push({ message: "password required" });
  }
  if (errors.length > 0) {
    return res.status(422).send(errors);
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User Doesn't Exist",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "password incorrect" });

    jwt.sign(
      { id: user.id, role: user.role },
      "secretkey",
      {
        expiresIn: 3600,
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          user: user.name,
          user: user.role,
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.post("/signup", async (req, res, next) => {
  const { email, name, password, password_confirmation } = req.body;
  let errors = [];
  if (!name) {
    errors.push({ message: "Name required" });
  }
  if (!email) {
    errors.push({ message: "Email required" });
  }
  if (!emailRegexp.test(email)) {
    errors.push({ message: "Email invalid" });
  }
  if (!password) {
    errors.push({ message: "Password required" });
  }
  if (!password_confirmation) {
    errors.push({
      message: "confirm password required",
    });
  }
  if (password != password_confirmation) {
    errors.push({ message: "Password mismatch" });
  }
  if (errors.length > 0) {
    return res.status(422).send(errors[0]);
  }

  try {
    let user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    user = new User({
      email,
      name,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(200).json({
      user,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      message: "Error in Saving",
    });
  }
});

router.get("/getrequest", UserAuthCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const asset = await Request.find({ user })
      .populate("item")
      .populate("user");

    // const { quantity, reason, timestamp } = asset;
    // asset.name = user.name;
    const data = { user: user.name, asset };
    res.status(200).send(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.get("/getresponse", UserAuthCheck, async (req, res) => {
  try {
    const asset = await Response.find()
      .populate("request")
      .populate("updatedby");
    res.status(200).send(asset);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/createresponse/:id", userAuthCheck, async (req, res) => {
  const query = req.body.query;
  const _id = req.params.id;
  req.user = "640ae065bd60dc0e29a31fe4";
  try {
    const response = await Response.create({
      updatedby: req.user,
      request: _id,
      query: "no-query",
      // timestamp,
    });

    res.status(201).json({ message: "Request created successfully", response });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// {}, { name: 1, user: 0, _id: 0 }

router.get("/getrequest/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const request = await Item.find({ _id }).populate("user");
    res.send(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//asset routes

router.get("/getasset", userAuthCheck, async (req, res) => {
  try {
    const request = await Item.find().populate("user");
    res.status(201).send(request);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/addasset", userAuthCheck, async (req, res) => {
  const { name, dop, assetsvalue, serialnumber, comments } = req.body;
  try {
    const response = await Item.create({
      user: req.user,
      name,
      dop,
      serialnumber,
      assetsvalue,
      comments,
    });
    res.status(201).json({ message: "Request created successfully", response });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//ticket routes

router.get("/getticket", userAuthCheck, async (req, res) => {
  try {
    const request = await Request.find().populate("item");

    res.status(201).send(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/getassetdata", userAuthCheck, async (req, res) => {
  const asset = req.body.data;
  try {
    const request = await Item.find({ name: asset }).populate("user");
    res.status(201).send(request[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/addticket", userAuthCheck, async (req, res) => {
  const { asset, title, date, description, status } = req.body;
  try {
    const item = await Item.findOne({ name: asset });
    const request = await Request.create({
      title,
      date,
      description,
      item: item._id,
      status,
    });
    res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/updateticket/:id", adminAuthCheck, async (req, res) => {
  const { id } = req.params;
  try {
    const updatedResult = await Request.findByIdAndUpdate(
      { _id: id },
      {
        status: 1,
      },
      {
        new: true,
      }
    );
    res.status(201).send(updatedResult);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
