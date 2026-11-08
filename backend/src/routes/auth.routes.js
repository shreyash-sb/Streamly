import { Router } from "express";
import { register, login, refresh, logout, getMe, updateProfile, deleteAccount } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);
router.delete("/account", requireAuth, deleteAccount);

export default router;

