const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
  updatedby: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true,
  },
  request: {
    type: mongoose.Schema.ObjectId,
    ref: "request",
    required: true,
  },
  query: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("response", ResponseSchema);
