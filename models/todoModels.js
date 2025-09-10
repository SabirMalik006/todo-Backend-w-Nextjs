// models/Todo.js
import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  status: {
    type: String,
    enum: ["todo", "pending", "done"],
    default: "todo",
  },
  order: {
    type: Number,
    default: 0, 
  },
});

export default mongoose.models.Todo || mongoose.model("Todo", todoSchema);
