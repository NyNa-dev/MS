import express from "express";
import { redirectToSpotifyLogin, spotifyCallback, getUser, searchPlaylistsByMood, searchTracksByMood } from "../controllers/spotify.controllers.js";


const router = express.Router();

router.get("/login", redirectToSpotifyLogin)
router.get("/callback", spotifyCallback)
router.get("/me", getUser)
router.get("/search/playlist", searchPlaylistsByMood)
router.get("/search/track", searchTracksByMood)

export default router;
