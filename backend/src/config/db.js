import mongoose from "mongoose";

let isDbConnected = false;

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes("<username>")) {
        console.warn("\n[!] MongoDB URI is not configured yet. Operating in in-memory guest/signaling mode.");
        console.warn("[!] Persistent accounts and cloud meeting history will activate when MONGO_URI is set.\n");
        isDbConnected = false;
        return false;
    }

    try {
        mongoose.set("strictQuery", true);
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        isDbConnected = true;
        console.log(`[+] MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (err) {
        isDbConnected = false;
        console.error(`[-] MongoDB Connection Error: ${err.message}`);
        console.warn("[!] Continuing in fallback in-memory mode so video calls still work without interruption.\n");
        return false;
    }
};

export const getDbStatus = () => isDbConnected;

