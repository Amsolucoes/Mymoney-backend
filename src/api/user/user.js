const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, minlength: 6, required: true },
});

module.exports = mongoose.model("User", userSchema);