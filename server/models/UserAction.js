import mongoose from "mongoose";

const userActionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  actionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Action",
    required: true
  },
  completedDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("UserAction", userActionSchema);
