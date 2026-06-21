import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    targetCarbon: {
      type: Number,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Goal", goalSchema);
