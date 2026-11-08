import { Router } from "express";
import {
    createMeeting,
    getMeetingInfo,
    verifyMeetingPasscode,
    getUserMeetings,
    getMeetingDetail,
    saveMeetingArtifacts,
    deleteMeeting,
} from "../controllers/meeting.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create", optionalAuth, createMeeting);
router.get("/user", requireAuth, getUserMeetings);
router.get("/:code", getMeetingInfo);
router.post("/:code/verify", verifyMeetingPasscode);
router.get("/:code/detail", optionalAuth, getMeetingDetail);
router.post("/:code/artifacts", optionalAuth, saveMeetingArtifacts);
router.delete("/:code", requireAuth, deleteMeeting);

export default router;

