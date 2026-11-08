import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 attempts per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login/registration attempts from this IP, please try again in 15 minutes." }
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." }
});

