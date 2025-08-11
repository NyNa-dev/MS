// models/DailyAnalytics.js
import mongoose from "mongoose";

const dailyAnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD" in user's timezone
  moodCounts: { type: Map, of: Number, default: {} },
  topTracks: [{ trackId: String, title: String, plays: Number, source: String }],
  generatedAt: { type: Date, default: Date.now },
  ready: { type: Boolean, default: false }
}, { timestamps: true });

dailyAnalyticsSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyAnalytics = mongoose.model("DailyAnalytics", dailyAnalyticsSchema);

export default DailyAnalytics;
