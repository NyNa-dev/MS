import express from "express";
import { getEmotion } from "../controllers/emotion.controllers.js";


const router = express.Router()

router.post("/", getEmotion);

export default router;