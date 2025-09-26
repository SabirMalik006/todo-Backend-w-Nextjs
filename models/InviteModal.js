const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InviteSchema = new Schema(
  {
    email: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    team: { type: Schema.Types.ObjectId, ref: "Team" },  
    board: { type: Schema.Types.ObjectId, ref: "Board" },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invite", InviteSchema);
