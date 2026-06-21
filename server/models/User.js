import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      default: "user"
    },
    streakFreezes: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      default: "Bronze"
    },
    points: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    badges: {
      type: [String],
      default: []
    },
    lastActionDate: {
      type: Date,
      default: null
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);