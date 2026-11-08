import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        email: { type: String, trim: true, lowercase: true, default: "" },
        password: { type: String, required: true },
        refreshToken: { type: String, default: null },
        preferences: {
            defaultMuted: { type: Boolean, default: false },
            defaultVideoOff: { type: Boolean, default: false },
            defaultLanguage: { type: String, default: "en-US" },
            theme: { type: String, default: "dark" },
        },
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
