const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" }, 
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    columns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Column" }],
    visibility: { type: String, enum: ["team", "private"], default: "team" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
