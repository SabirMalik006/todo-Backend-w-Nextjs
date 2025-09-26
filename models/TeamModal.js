const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
});

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [MemberSchema],
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", TeamSchema);
