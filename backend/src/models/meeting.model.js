import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        meetingCode: { type: String, required: true, unique: true, index: true },
        title: { type: String, default: "Instant Meeting", trim: true },
        description: { type: String, default: "" },
        hostUsername: { type: String, default: "guest", index: true },
        hostName: { type: String, default: "Host" },
        passcodeHash: { type: String, default: null },
        isLocked: { type: Boolean, default: false },
        waitingRoomEnabled: { type: Boolean, default: false },
        requireAuth: { type: Boolean, default: false },
        scheduledFor: { type: Date, default: null },
        endedAt: { type: Date, default: null },
        durationSeconds: { type: Number, default: 0 },
        participants: [
            {
                username: String,
                name: String,
                joinedAt: { type: Date, default: Date.now },
                leftAt: { type: Date, default: null },
            },
        ],
        chat: [
            {
                sender: String,
                senderName: String,
                message: String,
                timestamp: { type: Date, default: Date.now },
                isPrivate: { type: Boolean, default: false },
                to: { type: String, default: null },
            },
        ],
        transcript: [
            {
                speaker: String,
                text: String,
                timestamp: { type: Date, default: Date.now },
            },
        ],
        summary: {
            overview: { type: String, default: "" },
            keyDecisions: [{ type: String }],
            actionItems: [
                {
                    task: String,
                    owner: String,
                },
            ],
            generatedAt: { type: Date, default: null },
        },
        polls: [
            {
                id: String,
                question: String,
                options: [
                    {
                        text: String,
                        votes: [{ type: String }],
                    },
                ],
                closed: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        notes: { type: String, default: "" },
        whiteboardData: { type: String, default: "" },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
