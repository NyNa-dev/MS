// controllers/analyticsController.js
import DailyAnalytics from "../models/DailyAnalytics.js";
import User from "../models/user.model.js";
import { DateTime } from "luxon";

export async function getAnalyticsStatus(req, res) {
  const { userId } = req.params;
  const user = await User.findById(userId).lean();
  const tz = user?.timezone || "Africa/Accra";
  const yesterday = DateTime.now().setZone(tz).minus({ days: 1 }).toFormat("yyyy-MM-dd");
  const rec = await DailyAnalytics.findOne({ user: userId, date: yesterday }).lean();
  const availableAt = DateTime.now().setZone(tz).plus({ days: 1 }).startOf("day").toISO();
  res.json({ ready: !!rec, date: yesterday, availableAt });
}

export async function getDailyAnalytics(req, res) {
  const { userId, date } = req.params;
  const rec = await DailyAnalytics.findOne({ user: userId, date }).lean();
  if (!rec) return res.status(404).json({ ready: false });
  return res.json(rec);
}
