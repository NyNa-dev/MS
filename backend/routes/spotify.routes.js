import express from "express";
import { redirectToSpotifyLogin, spotifyCallback, getUser } from "../controllers/spotify.controllers.js";


const router = express.Router();

router.get("/login", redirectToSpotifyLogin)
router.get("/callback", spotifyCallback)
router.get("/me", getUser)

export default router;
