const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  column: { type: mongoose.Schema.Types.ObjectId, ref: "Column" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  day: { type: String },
}, { timestamps: true });


module.exports = mongoose.model("Todo", todoSchema);
