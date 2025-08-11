import mongoose from "mongoose";

const trackHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  moodId: { type: mongoose.Schema.Types.ObjectId, ref: "Mood", required: true },
  trackId: { type: String, required: true },  // externalId from platform
  source: { type: String, enum: ["spotify", "youtube"], required: true },
  recommendedAt: { type: Date, default: Date.now }
});

const TrackHistory =  mongoose.model("TrackHistory", trackHistorySchema);

export default TrackHistory;
