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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", BoardSchema);
