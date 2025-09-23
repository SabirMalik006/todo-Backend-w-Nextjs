const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["member", "admin"], default: "member" },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Invite", inviteSchema);