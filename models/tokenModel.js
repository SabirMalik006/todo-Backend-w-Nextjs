// models/tokenModel.js
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  refreshToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60, // token expires after 7 days
  },
});

const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);

export default Token;
