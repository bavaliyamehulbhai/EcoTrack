import mongoose from "mongoose";

const actionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 10
  }
});

export default mongoose.model("Action", actionSchema);
