const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Number, default: 0 }, 
    isDefault: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Column", columnSchema);
