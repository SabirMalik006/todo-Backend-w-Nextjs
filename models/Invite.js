const mongoose = require("mongoose");
const inviteSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["admin", "member", "viewer"], default: "member" },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Invite", inviteSchema);
