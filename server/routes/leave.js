import express from "express";
import { requireAuth } from "../middleware/auth.js";
import LeaveRequest from "../models/LeaveRequest.js";

const router = express.Router();

// Get all leave requests (admin)
router.get("/all", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const requests = await LeaveRequest.find()
      .sort({ requestDate: -1 })
      .populate("userId", "name username email department");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get leave requests for current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ userId: req.user._id }).sort({
      requestDate: -1,
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit leave request
router.post("/", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create leave request
    const request = await LeaveRequest.create({
      userId: req.user._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "pending",
      requestDate: new Date(),
    });

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update leave request status (admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status, comments } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminComments: comments,
        updatedBy: req.user._id,
        updateDate: new Date(),
      },
      { new: true }
    ).populate("userId", "name username email department");

    if (!request) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
