const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [300, "Comment cannot exceed 300 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  column: { type: mongoose.Schema.Types.ObjectId, ref: "Column" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  day: { type: Date, default: Date.now },
  comments: [commentSchema],
}, { timestamps: true });



module.exports = mongoose.model("Todo", todoSchema);
