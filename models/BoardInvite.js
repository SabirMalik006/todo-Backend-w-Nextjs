const mongoose = require("mongoose");

const boardInviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now , expires: '3d' },
});

module.exports =
  mongoose.models.BoardInvite || mongoose.model("BoardInvite", boardInviteSchema);
