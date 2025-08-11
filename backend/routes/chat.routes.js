import express from "express";
import { handleMessage } from "../controllers/chat.controllers.js";

const router = express.Router();

router.post("/", handleMessage);

export default router;
