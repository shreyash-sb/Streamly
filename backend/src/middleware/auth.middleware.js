import { verifyAccessToken } from "../utils/token.js";
import { User } from "../models/user.model.js";
import { getDbStatus } from "../config/db.js";

/**
 * Authentication middleware that verifies JWT access token.
 * Populates req.user.
 */
export const requireAuth = async (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (getDbStatus()) {
        try {
            const user = await User.findById(decoded.id).select("-password -refreshToken");
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            req.user = user;
        } catch {
            req.user = { id: decoded.id, username: decoded.username, name: decoded.name };
        }
    } else {
        req.user = { id: decoded.id, username: decoded.username, name: decoded.name };
    }

    next();
};

/**
 * Optional authentication: attaches req.user if a valid token exists,
 * otherwise continues without rejecting. Useful for meeting endpoints that guests can also use.
 */
export const optionalAuth = async (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (token) {
        const decoded = verifyAccessToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }

    next();
};

