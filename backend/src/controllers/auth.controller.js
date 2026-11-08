import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { getDbStatus } from "../config/db.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
    try {
        const { name, username, password, email } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ message: "Name, username, and password are required" });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (!getDbStatus()) {
            return res.status(503).json({
                message: "Database is not connected. You can still use Streamly as an instant guest without an account!"
            });
        }

        const normalizedUsername = username.toLowerCase().trim();
        const existing = await User.findOne({ username: normalizedUsername });
        if (existing) {
            return res.status(409).json({ message: "Username is already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name.trim(),
            username: normalizedUsername,
            email: email ? email.trim() : "",
            password: hashedPassword,
        });

        const accessToken = generateAccessToken({ id: newUser._id, username: newUser.username, name: newUser.name });
        const refreshToken = generateRefreshToken({ id: newUser._id });

        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        return res.status(201).json({
            message: "User registered successfully",
            token: accessToken,
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                preferences: newUser.preferences,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        if (!getDbStatus()) {
            return res.status(503).json({
                message: "Database is not connected. You can continue as a guest or configure MONGO_URI in backend/.env"
            });
        }

        const normalizedUsername = username.toLowerCase().trim();
        const user = await User.findOne({ username: normalizedUsername });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const accessToken = generateAccessToken({ id: user._id, username: user.username, name: user.name });
        const refreshToken = generateRefreshToken({ id: user._id });

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        return res.json({
            message: "Logged in successfully",
            token: accessToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                preferences: user.preferences,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing" });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        if (!getDbStatus()) {
            return res.status(503).json({ message: "Database offline" });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Revoked refresh token" });
        }

        const newAccessToken = generateAccessToken({ id: user._id, username: user.username, name: user.name });
        const newRefreshToken = generateRefreshToken({ id: user._id });

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
        return res.json({ token: newAccessToken });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken && getDbStatus()) {
            const decoded = verifyRefreshToken(refreshToken);
            if (decoded) {
                await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
            }
        }

        res.clearCookie("refreshToken", COOKIE_OPTIONS);
        return res.json({ message: "Logged out successfully" });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res) => {
    return res.json({ user: req.user });
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, preferences } = req.body;
        if (!getDbStatus()) {
            return res.json({ user: { ...req.user, name, preferences } });
        }

        const user = await User.findById(req.user._id || req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name.trim();
        if (preferences) user.preferences = { ...user.preferences.toObject(), ...preferences };

        await user.save();
        return res.json({
            message: "Profile updated",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                preferences: user.preferences,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const deleteAccount = async (req, res, next) => {
    try {
        if (!getDbStatus()) {
            return res.json({ message: "Account deleted" });
        }
        await User.findByIdAndDelete(req.user._id || req.user.id);
        res.clearCookie("refreshToken", COOKIE_OPTIONS);
        return res.json({ message: "Account and personal data successfully deleted" });
    } catch (err) {
        next(err);
    }
};

