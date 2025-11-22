import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    requestDate: {
      type: Date,
      required: true,
    },
    adminComments: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updateDate: Date,
  },
  { timestamps: true }
);

const LeaveRequest = mongoose.model("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;
