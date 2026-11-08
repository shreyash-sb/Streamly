import { summarizeMeetingTranscript } from "../services/summaryService.js";
import { Meeting } from "../models/meeting.model.js";
import { normalizeMeetingCode } from "../utils/codeGenerator.js";
import { getDbStatus } from "../config/db.js";

export const summarizeMeeting = async (req, res, next) => {
    try {
        const { code, transcript } = req.body;
        let meetingTranscript = transcript;

        const normalizedCode = normalizeMeetingCode(code);
        if ((!meetingTranscript || meetingTranscript.length === 0) && normalizedCode && getDbStatus()) {
            const meeting = await Meeting.findOne({ meetingCode: normalizedCode });
            if (meeting && meeting.transcript && meeting.transcript.length > 0) {
                meetingTranscript = meeting.transcript;
            }
        }

        if (!meetingTranscript || meetingTranscript.length === 0) {
            return res.status(400).json({ message: "No transcript provided or found for this meeting" });
        }

        const summary = await summarizeMeetingTranscript(meetingTranscript);

        // Save to meeting if code provided and DB connected
        if (normalizedCode && getDbStatus()) {
            await Meeting.findOneAndUpdate(
                { meetingCode: normalizedCode },
                {
                    summary: {
                        ...summary,
                        generatedAt: new Date(),
                    },
                }
            );
        }

        return res.json({ summary });
    } catch (err) {
        next(err);
    }
};

