// services/youtubeService.js
import axios from "axios";

/**
 * Normalize YouTube search item -> Track shape
 * Uses YouTube Data API v3.
 */
function normalizeYouTubeItem(item) {
  const videoId = item.id.videoId || item.id.playlistId || null;
  const isPlaylist = Boolean(item.id.playlistId && !item.id.videoId);
  return {
    id: videoId,
    title: item.snippet.title,
    artists: [item.snippet.channelTitle],
    duration: null, // need an extra call to videos endpoint for duration
    preview: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    source: "youtube",
    metadata: {
      thumbnails: item.snippet.thumbnails
    },
    isPlaylist
  };
}

/**
 * Search YouTube for mood playlists / videos.
 * Returns normalized tracks (videos).
 */
export async function getYouTubeTracks(moodLabel, maxResults = 10) {
  const q = `${moodLabel} mood playlist`;
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("NO_YOUTUBE_KEY");

  const url = "https://www.googleapis.com/youtube/v3/search";
  const resp = await axios.get(url, {
    params: {
      key,
      q,
      part: "snippet",
      maxResults,
      type: "playlist"
    }
  });

  const items = resp.data.items || [];
  const tracks = items.map(normalizeYouTubeItem).filter(t => t.id);

  // Optionally fetch durations for videos (batch call)
  const videoIds = tracks.filter(t => !t.isPlaylist).map(t => t.id).slice(0, 50);
  if (videoIds.length) {
    const vidRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        key,
        id: videoIds.join(","),
        part: "contentDetails"
      }
    });
    const durationsMap = {};
    (vidRes.data.items || []).forEach(v => {
      durationsMap[v.id] = v.contentDetails.duration; // ISO 8601
    });
    tracks.forEach(t => {
      if (durationsMap[t.id]) t.duration = durationsMap[t.id];
    });
  }

  return tracks;
}
