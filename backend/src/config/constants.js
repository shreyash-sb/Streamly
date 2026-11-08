export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "streamly_jwt_access_secret_production_ready_key";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "streamly_jwt_refresh_secret_production_ready_key";
export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";

export const DEFAULT_ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
];

