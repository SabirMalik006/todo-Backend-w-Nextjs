const mongoose = require("mongoose");

const BoardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    team: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
    background: {
      type: {
        type: String,
        enum: ["solid", "gradient", "pattern"],
        default: "solid",
      },
      value: {
        type: String,
        default: "#ffffff",
      },
      accentTextColor: {
        type: String,
        default: "#000000",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", BoardSchema);
