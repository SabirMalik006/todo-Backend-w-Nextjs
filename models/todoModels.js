const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
    order: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    column: {
      type: String,
      enum: ["todo", "pending", "done"],
      default: "todo",
    },
    day: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
