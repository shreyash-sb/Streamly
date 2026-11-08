import bcrypt from "bcrypt";
import { Meeting } from "../models/meeting.model.js";
import { generateMeetingCode, normalizeMeetingCode } from "../utils/codeGenerator.js";
import { getDbStatus } from "../config/db.js";

// In-memory fallback meeting store when MongoDB is offline
const inMemoryMeetings = new Map();

export const createMeeting = async (req, res, next) => {
    try {
        const { title, description, passcode, waitingRoomEnabled, requireAuth, scheduledFor } = req.body;
        const meetingCode = generateMeetingCode();
        const hostUsername = req.user?.username || "guest";
        const hostName = req.user?.name || "Host";

        let passcodeHash = null;
        if (passcode && passcode.trim()) {
            passcodeHash = await bcrypt.hash(passcode.trim(), 10);
        }

        const meetingData = {
            meetingCode,
            title: title ? title.trim() : "Instant Meeting",
            description: description || "",
            hostUsername,
            hostName,
            passcodeHash,
            waitingRoomEnabled: !!waitingRoomEnabled,
            requireAuth: !!requireAuth,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
            date: new Date(),
        };

        if (getDbStatus()) {
            const meeting = new Meeting(meetingData);
            await meeting.save();
        } else {
            inMemoryMeetings.set(meetingCode, meetingData);
        }

        return res.status(201).json({
            message: "Meeting created",
            meetingCode,
            meeting: {
                meetingCode,
                title: meetingData.title,
                hostUsername,
                hasPasscode: !!passcodeHash,
                waitingRoomEnabled: meetingData.waitingRoomEnabled,
                scheduledFor: meetingData.scheduledFor,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getMeetingInfo = async (req, res, next) => {
    try {
        const code = normalizeMeetingCode(req.params.code);
        if (!code) {
            return res.status(400).json({ message: "Invalid meeting code" });
        }

        let meeting = null;
        if (getDbStatus()) {
            meeting = await Meeting.findOne({ meetingCode: code });
        } else {
            meeting = inMemoryMeetings.get(code);
        }

        if (!meeting) {
            // Allow ad-hoc meetings for seamless guest entry
            return res.json({
                meetingCode: code,
                title: "Instant Room",
                hasPasscode: false,
                isLocked: false,
                waitingRoomEnabled: false,
                requireAuth: false,
                isAdHoc: true,
            });
        }

        return res.json({
            meetingCode: meeting.meetingCode,
            title: meeting.title,
            description: meeting.description,
            hostUsername: meeting.hostUsername,
            hasPasscode: !!meeting.passcodeHash,
            isLocked: !!meeting.isLocked,
            waitingRoomEnabled: !!meeting.waitingRoomEnabled,
            requireAuth: !!meeting.requireAuth,
            scheduledFor: meeting.scheduledFor,
            isAdHoc: false,
        });
    } catch (err) {
        next(err);
    }
};

export const verifyMeetingPasscode = async (req, res, next) => {
    try {
        const code = normalizeMeetingCode(req.params.code);
        const { passcode } = req.body;

        let meeting = null;
        if (getDbStatus()) {
            meeting = await Meeting.findOne({ meetingCode: code });
        } else {
            meeting = inMemoryMeetings.get(code);
        }

        if (!meeting || !meeting.passcodeHash) {
            return res.json({ success: true });
        }

        if (!passcode) {
            return res.status(401).json({ success: false, message: "Meeting passcode is required" });
        }

        const isMatch = await bcrypt.compare(passcode.trim(), meeting.passcodeHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect meeting passcode" });
        }

        return res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

export const getUserMeetings = async (req, res, next) => {
    try {
        const username = req.user.username;

        if (!getDbStatus()) {
            const list = Array.from(inMemoryMeetings.values()).filter(m => m.hostUsername === username);
            return res.json(list);
        }

        const meetings = await Meeting.find({
            $or: [
                { hostUsername: username },
                { "participants.username": username },
            ],
        })
            .sort({ date: -1 })
            .limit(50);

        return res.json(meetings);
    } catch (err) {
        next(err);
    }
};

export const getMeetingDetail = async (req, res, next) => {
    try {
        const code = normalizeMeetingCode(req.params.code);

        let meeting = null;
        if (getDbStatus()) {
            meeting = await Meeting.findOne({ meetingCode: code });
        } else {
            meeting = inMemoryMeetings.get(code);
        }

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        return res.json(meeting);
    } catch (err) {
        next(err);
    }
};

export const saveMeetingArtifacts = async (req, res, next) => {
    try {
        const code = normalizeMeetingCode(req.params.code);
        const { transcript, chat, notes, whiteboardData, polls, durationSeconds, participants } = req.body;

        if (getDbStatus()) {
            let meeting = await Meeting.findOne({ meetingCode: code });
            if (!meeting) {
                meeting = new Meeting({
                    meetingCode: code,
                    hostUsername: req.user?.username || "guest",
                    title: "Instant Meeting",
                });
            }

            if (transcript) meeting.transcript = transcript;
            if (chat) meeting.chat = chat;
            if (notes) meeting.notes = notes;
            if (whiteboardData) meeting.whiteboardData = whiteboardData;
            if (polls) meeting.polls = polls;
            if (durationSeconds) meeting.durationSeconds = durationSeconds;
            if (participants) meeting.participants = participants;
            meeting.endedAt = new Date();

            await meeting.save();
            return res.json({ message: "Meeting artifacts saved successfully", meeting });
        }

        return res.json({ message: "Artifacts acknowledged (in-memory mode)" });
    } catch (err) {
        next(err);
    }
};

export const deleteMeeting = async (req, res, next) => {
    try {
        const code = normalizeMeetingCode(req.params.code);
        if (getDbStatus()) {
            await Meeting.findOneAndDelete({ meetingCode: code, hostUsername: req.user.username });
        } else {
            inMemoryMeetings.delete(code);
        }
        return res.json({ message: "Meeting deleted" });
    } catch (err) {
        next(err);
    }
};

