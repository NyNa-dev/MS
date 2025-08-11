// services/analyticsService.js
import mongoose from "mongoose";
import { DateTime } from "luxon";
import DailyAnalytics from "../models/DailyAnalytics.js";
import Mood from "../models/mood.js";
import TrackHistory from "../models/trackHistory.js";

export async function generateDailyAnalyticsForDate(userId, dateISO, timezone = "Africa/Accra") {
  // dateISO: 'YYYY-MM-DD' (the day we want to summarize)
  const start = DateTime.fromISO(dateISO, { zone: timezone }).startOf("day").toJSDate();
  const end = DateTime.fromISO(dateISO, { zone: timezone }).endOf("day").toJSDate();

  const userOid = mongoose.Types.ObjectId(userId);

  // moods
  const moodAgg = await Mood.aggregate([
    { $match: { user: userOid, detectedAt: { $gte: start, $lte: end } } },
    { $group: { _id: "$mood", count: { $sum: 1 } } }
  ]);

  const moodCounts = {};
  moodAgg.forEach(r => { moodCounts[r._id] = r.count; });

  // tracks (top by times recommended)
  const trackAgg = await TrackHistory.aggregate([
    { $match: { user: userOid, recommendedAt: { $gte: start, $lte: end } } },
    { $group: { _id: { trackId: "$trackId", source: "$source" }, plays: { $sum: 1 } } },
    { $sort: { plays: -1 } },
    { $limit: 20 }
  ]);

  const topTracks = trackAgg.map(t => ({ trackId: t._id.trackId, source: t._id.source, plays: t.plays }));

  await DailyAnalytics.findOneAndUpdate(
    { user: userId, date: dateISO },
    { user: userId, date: dateISO, moodCounts, topTracks, generatedAt: new Date(), ready: true },
    { upsert: true }
  );

  return { moodCounts, topTracks };
}
