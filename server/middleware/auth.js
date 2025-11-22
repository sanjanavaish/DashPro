import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const secret = process.env.JWT_SECRET || "change_this_secret";
    const payload = jwt.verify(token, secret);
    req.user = payload;
    req.user._id = new mongoose.Types.ObjectId(payload.id); // Convert to ObjectId
    req.user.id = payload.id; // Also set id for compatibility
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
