/**
 * Generates an extractive summary from meeting transcript sentences
 * when no LLM API key is provided.
 */
export const generateExtractiveSummary = (transcript) => {
    if (!transcript || transcript.length === 0) {
        return {
            overview: "No transcript recorded for this meeting.",
            keyDecisions: [],
            actionItems: [],
        };
    }

    const sentences = [];
    transcript.forEach((item) => {
        const text = item.text || "";
        const parts = text.split(/(?<=[.?!])\s+/);
        parts.forEach((p) => {
            const clean = p.trim();
            if (clean.length > 5) {
                sentences.push({ speaker: item.speaker || "Participant", text: clean });
            }
        });
    });

    if (sentences.length === 0) {
        return {
            overview: "Meeting concluded with brief audio exchanges.",
            keyDecisions: [],
            actionItems: [],
        };
    }

    // Stop words for word frequency scoring
    const stopWords = new Set([
        "the", "is", "at", "which", "on", "and", "a", "an", "in", "to", "for", "with", "it",
        "of", "that", "this", "we", "you", "they", "i", "can", "are", "be", "so", "our", "my"
    ]);

    const wordFreq = {};
    sentences.forEach((s) => {
        const words = s.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        words.forEach((w) => {
            if (!stopWords.has(w)) {
                wordFreq[w] = (wordFreq[w] || 0) + 1;
            }
        });
    });

    const decisionKeywords = ["decide", "agreed", "will do", "approved", "plan to", "resolved", "conclusion", "settled", "chosen"];
    const actionKeywords = ["action", "todo", "will handle", "will send", "assigned", "follow up", "prepare", "by tomorrow", "by next"];

    const keyDecisions = [];
    const actionItems = [];

    sentences.forEach((s) => {
        const lower = s.text.toLowerCase();

        // Check for decisions
        if (decisionKeywords.some((k) => lower.includes(k))) {
            if (keyDecisions.length < 5) {
                keyDecisions.push(`${s.speaker}: ${s.text}`);
            }
        }

        // Check for action items
        if (actionKeywords.some((k) => lower.includes(k))) {
            if (actionItems.length < 6) {
                actionItems.push({
                    task: s.text,
                    owner: s.speaker,
                });
            }
        }
    });

    // Score sentences for overview
    const scoredSentences = sentences.map((s, idx) => {
        const words = s.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        let score = 0;
        words.forEach((w) => {
            score += wordFreq[w] || 0;
        });
        return { ...s, score, idx };
    });

    scoredSentences.sort((a, b) => b.score - a.score);
    const topSentences = scoredSentences.slice(0, 3).sort((a, b) => a.idx - b.idx);
    const overview = topSentences.map((s) => `${s.speaker}: "${s.text}"`).join(" ");

    return {
        overview: overview || "Meeting discussion covered key team initiatives and collaborative updates.",
        keyDecisions: keyDecisions.length > 0 ? keyDecisions : ["Collaborative consensus reached on discussed topics."],
        actionItems: actionItems.length > 0 ? actionItems : [{ task: "Review shared notes and follow up on meeting topics", owner: "All participants" }],
    };
};

/**
 * Summarizes meeting transcript via LLM if LLM_API_KEY is present,
 * otherwise falls back gracefully to extractive summary.
 */
export const summarizeMeetingTranscript = async (transcript) => {
    const apiKey = process.env.LLM_API_KEY;

    if (!apiKey) {
        return generateExtractiveSummary(transcript);
    }

    try {
        const transcriptText = transcript
            .map((t) => `[${t.speaker || "Participant"}]: ${t.text}`)
            .join("\n");

        const prompt = `You are an AI meeting assistant. Summarize the following meeting transcript into JSON with exactly these keys:
- overview: A concise 2-3 sentence overview of the meeting.
- keyDecisions: An array of strings representing key decisions made.
- actionItems: An array of objects with "task" (string) and "owner" (string).

Transcript:
${transcriptText}

Respond ONLY with valid JSON.`;

        // Support Gemini API or OpenAI-compatible endpoint
        const endpoint = process.env.LLM_ENDPOINT || `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        if (!res.ok) {
            console.warn("LLM API call failed with status", res.status, "falling back to extractive summary.");
            return generateExtractiveSummary(transcript);
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) return generateExtractiveSummary(transcript);

        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (err) {
        console.error("Error calling LLM, using extractive summary fallback:", err.message);
        return generateExtractiveSummary(transcript);
    }
};

