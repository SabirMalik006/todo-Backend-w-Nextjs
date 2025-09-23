const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["owner", "admin", "member", "viewer"], default: "member" }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Team || mongoose.model("Team", teamSchema);
