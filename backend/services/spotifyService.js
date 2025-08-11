// services/spotifyService.js
import SpotifyWebApi from "spotify-web-api-node";
import { getUserPlatformTokens, saveUserPlatformTokens } from "../utils/tokenStore.js";

/**
 * Normalize Spotify track item -> our Track shape
 */
function normalizeSpotifyTrack(item) {
  return {
    id: item.id,
    title: item.name,
    artists: item.artists.map(a => a.name),
    duration: item.duration_ms,
    preview: item.preview_url,
    url: item.external_urls?.spotify,
    source: "spotify",
    metadata: {
      album: item.album?.name,
      images: item.album?.images
    }
  };
}

/**
 * Search Spotify for mood and return array of normalized tracks.
 * Automatically refreshes token once if expired.
 */
export async function getSpotifyTracks(userId, moodLabel, limit = 10) {
  const tokens = await getUserPlatformTokens(userId, "spotify");
  if (!tokens?.accessToken) throw new Error("NO_SPOTIFY_TOKEN");

  const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  });
  spotify.setAccessToken(tokens.accessToken);
  if (tokens.refreshToken) spotify.setRefreshToken(tokens.refreshToken);

  async function searchOnce() {
    // strategy: search for mood playlists / tracks; combine results
    // 1) search playlists for "<mood> playlist"
    const q = `${moodLabel} mood playlist`;
    const playlistRes = await spotify.searchPlaylists(q, { limit: 3 });
    const playlists = (playlistRes.body.playlists.items || []);

    // try to grab tracks from first playlist(s)
    for (const p of playlists) {
      try {
        const tracksRes = await spotify.getPlaylistTracks(p.id, { limit });
        const items = tracksRes.body.items || [];
        // some items are { track: {...} }
        const tracks = items
          .map(i => i.track)
          .filter(Boolean)
          .map(normalizeSpotifyTrack);
        if (tracks.length) return tracks;
      } catch (e) {
        // ignore playlist-level errors and try next
      }
    }

    // fallback: search tracks directly
    const trackRes = await spotify.searchTracks(`${moodLabel} song`, { limit });
    return (trackRes.body.tracks.items || []).map(normalizeSpotifyTrack);
  }

  try {
    return await searchOnce();
  } catch (err) {
    // if auth error, try refresh once
    const isAuthErr = err?.statusCode === 401 || /invalid token/i.test(err?.message || "");
    if (isAuthErr && tokens.refreshToken) {
      const refreshed = await spotify.refreshAccessToken();
      const newAccess = refreshed.body.access_token;
      spotify.setAccessToken(newAccess);
      // persist new access token (keep refresh token)
      await saveUserPlatformTokens(userId, "spotify", {
        accessToken: newAccess,
        refreshToken: tokens.refreshToken
      });
      // retry
      return await searchOnce();
    }
    throw err;
  }
}
