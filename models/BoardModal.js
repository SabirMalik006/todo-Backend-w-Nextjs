const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["admin","member"], default: "member" },
    },
  ],
  columns: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Board", boardSchema);
