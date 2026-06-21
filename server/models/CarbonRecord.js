import mongoose from "mongoose";

const carbonRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    transport: {
      type: Number,
      default: 0
    },
    electricity: {
      type: Number,
      default: 0
    },
    food: {
      type: Number,
      default: 0
    },
    waste: {
      type: Number,
      default: 0
    },
    water: {
      type: Number,
      default: 0
    },
    totalCarbon: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("CarbonRecord", carbonRecordSchema);
