const mongoose = require("mongoose");

const boardTeamSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 👈 add members array
  role: { type: String, enum: ["owner", "member"], default: "member" },
});

module.exports = mongoose.model("BoardTeam", boardTeamSchema);
