const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AssetSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  dop: {
    type: Date,
    // unique: true,
  },
  serialnumber: {
    type: Number,
    // unique: true,
  },
  comments: {
    type: String,
  },
  assetsvalue: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("item", AssetSchema);
