// utils/tokenStore.js
// NOTE: Replace these stubs with your actual DB logic (User model field reads/writes).

import User from "../models/user.model.js";

/**
 * Returns { accessToken, refreshToken } or null
 */
export async function getUserPlatformTokens(userId, platform = "spotify") {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  if (platform === "spotify") return user.spotifyTokens || null;
  if (platform === "youtube") return user.youtubeTokens || null;
  return null;
}

/**
 * Save refreshed tokens back to user record.
 * tokens: { accessToken, refreshToken, expiresAt? }
 */
export async function saveUserPlatformTokens(userId, platform = "spotify", tokens = {}) {
  const update = platform === "spotify"
    ? { spotifyTokens: tokens }
    : { youtubeTokens: tokens };
  await User.findByIdAndUpdate(userId, update);
}
