import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      required: true,
    },
    checkIn: {
      type: Date,
      required: function () {
        return this.status !== "absent";
      },
    },
    checkOut: { type: Date },
    hoursWorked: { type: Number },
    checkInLocation: {
      lat: Number,
      lng: Number,
      accuracy: Number,
    },
    checkOutLocation: {
      lat: Number,
      lng: Number,
      accuracy: Number,
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
