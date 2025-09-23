const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String, default: null },
    googleId: { type: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }]
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
