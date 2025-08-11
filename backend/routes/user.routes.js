import express from "express";
import protectRoute  from "../middlelayer/protectRoute.js";
import { getUsersforSidebar } from "../controllers/user.controller.js";

//import { setPreferredPlatform } from "../controllers/user.controller.js"

const router = express.Router();

router.get("/", protectRoute, getUsersforSidebar)
//router.patch('/preferences', protectRoute, setPreferredPlatform); 
router.get("/health", (req, res) => {
    res.status(200).json({ message: "User service is running" });
})

export default router;