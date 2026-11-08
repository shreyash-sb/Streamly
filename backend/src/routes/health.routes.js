import { Router } from "express";
import { getDbStatus } from "../config/db.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "Streamly API & Signaling Server",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: getDbStatus() ? "connected" : "in-memory-fallback",
        version: "2.0.0",
    });
});

export default router;

