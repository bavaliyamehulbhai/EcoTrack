import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    adminName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetId: {
      type: String,
      required: true
    },
    targetName: {
      type: String,
      required: true
    },
    details: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("AuditLog", auditLogSchema);
