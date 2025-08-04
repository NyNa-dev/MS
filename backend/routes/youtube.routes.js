
import express from "express";
import { redirectToYoutubeLogin, youtubeCallback, getYoutubeUser } from "../controllers/youtube.controller.js";


const router = express.Router();

router.get("/login", redirectToYoutubeLogin);
router.get("/callback", youtubeCallback);
router.get("/me", getYoutubeUser);


export default router;