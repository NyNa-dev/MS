import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  mood: String,          // mapped label
  rawEmotion: String,    // from NLP
  confidence: Number,
  detectedAt: Date
});

const Mood =  mongoose.model("Mood", moodSchema);

export default Mood;

