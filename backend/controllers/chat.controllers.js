import Message from "../models/message.model.js";
import Mood from "../models/mood.js";
import TrackHistory from "../models/trackHistory.js";
import User from "../models/user.model.js";

import { hasFiveMinutesPassed } from "../utils/timeCheck.js";
import { detectMood } from "../services/moodDetector.js";
import { mapEmotionToMood } from "../services/moodMapper.js";
import { getSpotifyTracks } from "../services/spotifyService.js";
import { getYouTubeTracks } from "../services/youtubeService.js";

export async function handleMessage(req, res) {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !text || !receiverId) {
      return res.status(400).json({ error: "senderId, receiverId and text are required" });
    }

    // 1️⃣ Save the message
    const message = await Message.create({
      senderId,
      receiverId,
      message: text,
      createdAt: new Date()
    });

    // 2️⃣ Check 5-minute continuous texting rule
    const passedFiveMinutes = await hasFiveMinutesPassed(senderId);
    if (!passedFiveMinutes) {
      return res.json({
        mood: null,
        playlist: [],
        info: "Mood detection starts after 5 minutes of continuous texting."
      });
    }

    // 3️⃣ Detect mood using NLP
    const { emotion, confidence } = await detectMood(text);

    // ✅ Neutral fallback if no emotion detected or unknown emotion
    const safeEmotion = emotion && emotion.trim() ? emotion.toLowerCase() : "neutral";

    // map to app mood label
    const moodLabel = mapEmotionToMood(safeEmotion);

    // 4️⃣ Save mood
    const moodDoc = await Mood.create({
      user: senderId,
      messageId: message._id,
      mood: moodLabel,
      rawEmotion: emotion,
      confidence,
      detectedAt: new Date()
    });

    // 5️⃣ Get user’s preferred platform
    const user = await User.findById(senderId).lean();
    const userPref = user?.preferredPlatform || "spotify";

    // 6️⃣ Fetch playlist from the chosen platform
    let playlist = [];
    try {
    if (userPref === "spotify") {
        playlist = await getSpotifyTracks(senderId, moodLabel);
        // If no playlist found for this mood, get trending from Spotify
        if (!playlist.length) {
        playlist = await getSpotifyTrending(senderId); 
        }
    } else if (userPref === "youtube") {
        playlist = await getYouTubeTracks(moodLabel);
        // If no playlist found for this mood, get trending from YouTube
        if (!playlist.length) {
        playlist = await getYouTubeTrending();
        }
    }
    } catch (err) {
    console.error(`${userPref} fetch failed:`, err.message);
    // If API fails, return trending from the same platform
    if (userPref === "spotify") {
        playlist = await getSpotifyTrending(senderId);
    } else if (userPref === "youtube") {
        playlist = await getYouTubeTrending();
    }
    }


    // 7️⃣ Save track history
    if (playlist.length) {
      await TrackHistory.insertMany(
        playlist.map(track => ({
          user: senderId,
          moodId: moodDoc._id,
          trackId: track.id, // externalId from platform
          source: track.source,
          recommendedAt: new Date()
        }))
      );
    }

    // 8️⃣ Return mood + playlist to frontend
    return res.json({
      mood: moodLabel,
      rawEmotion: safeEmotion,
      confidence: confidence || 0,
      playlist
    });
  } catch (err) {
    console.error("handleMessage error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
