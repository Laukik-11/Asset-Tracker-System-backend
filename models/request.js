const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  title: {
    type: String,
  },
  item: {
    type: mongoose.Schema.ObjectId,
    ref: "item",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
  status: {
    type: Boolean,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("request", RequestSchema);
