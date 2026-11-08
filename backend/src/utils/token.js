import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
        return null;
    }
};

