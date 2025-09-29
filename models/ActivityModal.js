
const mongoose = require("mongoose");   

const activitySchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  action: { type: String, required: true },  
  user: { type: String, required: true },    
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Activity", activitySchema);