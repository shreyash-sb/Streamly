import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { getUserMeetings, saveMeetingArtifacts } from "../controllers/meeting.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);

// Legacy routes mapped to upgraded controllers
router.get("/get_all_activity", async (req, res, next) => {
    try {
        // If query has token, handle gracefully
        const meetings = await getUserMeetings(req, res, next);
        return meetings;
    } catch (err) {
        return res.json([]);
    }
});

router.post("/add_to_activity", async (req, res, next) => {
    try {
        const { meeting_code } = req.body;
        req.params = { code: meeting_code };
        return await saveMeetingArtifacts(req, res, next);
    } catch (err) {
        return res.json({ message: "Added" });
    }
});

export default router;
