const emotionToMood = {
  anger: "angry",
  love: "love",
  fear: "fearful",
  joy: "happy",
  sadness: "sad",
  surprise: "surprised",
  neutral: "neutral"
};

/**
 * Maps a raw emotion from NLP into a MoodSense mood label.
 * Returns "neutral" if the emotion is not recognized or missing.
 */
export function mapEmotionToMood(emotion) {
  if (!emotion || typeof emotion !== "string") {
    return "neutral";
  }

  const normalized = emotion.trim().toLowerCase();

  return emotionToMood[normalized] || "neutral";
}
