import express from "express";
import Attendance from "../models/Attendance.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Admin - get all attendance records
router.get("/all", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .populate("userId", "name username email department");

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get today's attendance for user
router.get("/today", requireAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.json(record || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get attendance history with optional date range
router.get("/history", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Check-in
router.post("/checkin", requireAuth, async (req, res) => {
  try {
    const { location } = req.body;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Determine if late (after 9 AM)
    const isLate = now.getHours() >= 9 && now.getMinutes() > 0;

    const record = await Attendance.create({
      userId: req.user._id,
      date: today,
      status: isLate ? "late" : "present",
      checkIn: now,
      checkInLocation: { lat: 0, lng: 0, accuracy: 0 }, // Placeholder for location
    });

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Check-out
router.post("/checkout/:id", requireAuth, async (req, res) => {
  try {
    const { location } = req.body;
    const now = new Date();

    const record = await Attendance.findOne({
      _id: req.params.id,
      userId: req.user._id,
      checkOut: { $exists: false },
    });

    if (!record) {
      return res.status(404).json({ error: "No active check-in found" });
    }

    // Calculate hours worked
    const hoursWorked =
      Math.round(
        ((now.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60)) * 100
      ) / 100;

    record.checkOut = now;
    record.checkOutLocation = { lat: 0, lng: 0, accuracy: 0 }; // Placeholder for location
    record.hoursWorked = hoursWorked;
    await record.save();

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
