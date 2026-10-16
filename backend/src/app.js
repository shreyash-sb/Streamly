import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes("<username>")) {
        console.warn("\n[!] MongoDB URI is not configured yet.");
        console.warn("[!] Set your own connection string in backend/.env when you are ready.\n");
        server.listen(app.get("port"), () => {
            console.log(`Server listening on port ${app.get("port")} (without DB connection)`);
        });
        return;
    }

    try {
        const connectionDb = await mongoose.connect(mongoUri);
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
    }

    server.listen(app.get("port"), () => {
        console.log(`LISTENIN ON PORT ${app.get("port")}`);
    });
};

start();