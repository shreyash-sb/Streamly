import { Router } from "express";
import { summarizeMeeting } from "../controllers/ai.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/summarize", optionalAuth, summarizeMeeting);

export default router;

