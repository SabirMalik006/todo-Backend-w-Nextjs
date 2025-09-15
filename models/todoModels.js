const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  column: { type: mongoose.Schema.Types.ObjectId, ref: "Column", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: { type: String },
}, { timestamps: true });


module.exports = mongoose.model("Todo", todoSchema);
