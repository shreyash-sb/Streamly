import { Server } from "socket.io";
import { normalizeMeetingCode } from "../utils/codeGenerator.js";
import { DEFAULT_ICE_SERVERS } from "../config/constants.js";

/**
 * In-memory room manager for real-time signaling, security, and collaboration.
 * room: {
 *   code: string,
 *   hostSocketId: string,
 *   isLocked: boolean,
 *   waitingRoomEnabled: boolean,
 *   participants: Map<socketId, { socketId, name, username, isHost, isAudioMuted, isVideoMuted, handRaised, joinedAt }>,
 *   waitingRoom: Map<socketId, { socketId, name, username, joinedAt }>,
 *   chat: Array,
 *   polls: Array,
 *   notes: string,
 *   isRecording: boolean
 * }
 */
const rooms = new Map();

export const initSocketServer = (server, corsOrigin = "*") => {
    const io = new Server(server, {
        cors: {
            origin: corsOrigin,
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingTimeout: 20000,
        pingInterval: 10000,
    });

    const getOrCreateRoom = (roomCode, hostSocketId = null) => {
        const code = normalizeMeetingCode(roomCode);
        if (!rooms.has(code)) {
            rooms.set(code, {
                code,
                hostSocketId,
                isLocked: false,
                waitingRoomEnabled: false,
                participants: new Map(),
                waitingRoom: new Map(),
                chat: [],
                polls: [],
                notes: "",
                isRecording: false,
            });
        }
        return rooms.get(code);
    };

    const getIceServers = () => {
        const turnUrl = process.env.TURN_SERVER_URL;
        const turnUser = process.env.TURN_USERNAME;
        const turnCred = process.env.TURN_CREDENTIAL;

        const servers = [...DEFAULT_ICE_SERVERS];
        if (turnUrl && turnUser && turnCred) {
            servers.push({
                urls: turnUrl,
                username: turnUser,
                credential: turnCred,
            });
        }
        return servers;
    };

    io.on("connection", (socket) => {
        let currentRoomCode = null;

        // 1. Join request (with waiting room and lock checks)
        socket.on("join-room", ({ roomCode, name, username, isHostRequested }) => {
            const code = normalizeMeetingCode(roomCode);
            if (!code) {
                return socket.emit("error-message", { message: "Invalid room code" });
            }

            const room = getOrCreateRoom(code);

            // Assign initial host if room is empty
            if (!room.hostSocketId || room.participants.size === 0) {
                room.hostSocketId = socket.id;
            }

            const isHost = room.hostSocketId === socket.id;

            // Room Lock Check
            if (room.isLocked && !isHost) {
                return socket.emit("room-locked", {
                    message: "This room is currently locked by the host.",
                });
            }

            // Waiting Room Check
            if (room.waitingRoomEnabled && !isHost) {
                room.waitingRoom.set(socket.id, {
                    socketId: socket.id,
                    name: name || "Guest",
                    username: username || "guest",
                    joinedAt: new Date(),
                });

                socket.join(`${code}:waiting`);
                socket.emit("waiting-for-host", {
                    message: "The host has enabled a waiting room. You will join once admitted.",
                });

                // Notify host
                const waitingList = Array.from(room.waitingRoom.values());
                io.to(room.hostSocketId).emit("waiting-room-update", { waitingList });
                return;
            }

            // Direct admission
            admitSocketToRoom(socket, room, name, username, isHost);
        });

        const admitSocketToRoom = (sock, room, name, username, isHost) => {
            currentRoomCode = room.code;
            sock.join(room.code);

            const participantInfo = {
                socketId: sock.id,
                name: name || "Guest",
                username: username || "guest",
                isHost: isHost || room.hostSocketId === sock.id,
                isAudioMuted: false,
                isVideoMuted: false,
                handRaised: false,
                joinedAt: new Date(),
            };

            room.participants.set(sock.id, participantInfo);

            const participantList = Array.from(room.participants.values());

            // Send config, participant list, chat history, notes, polls to newly joined peer
            sock.emit("room-joined", {
                roomCode: room.code,
                socketId: sock.id,
                isHost: participantInfo.isHost,
                iceServers: getIceServers(),
                participants: participantList,
                isLocked: room.isLocked,
                waitingRoomEnabled: room.waitingRoomEnabled,
                isRecording: room.isRecording,
                chat: room.chat.slice(-50),
                notes: room.notes,
                polls: room.polls,
            });

            // Notify everyone else in the room
            sock.to(room.code).emit("user-joined", {
                newParticipant: participantInfo,
                participants: participantList,
            });
        };

        // 2. Waiting room host actions
        socket.on("admit-user", ({ targetSocketId }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            const waitingUser = room.waitingRoom.get(targetSocketId);
            if (waitingUser) {
                room.waitingRoom.delete(targetSocketId);
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.leave(`${room.code}:waiting`);
                    targetSocket.emit("admitted-by-host");
                    admitSocketToRoom(targetSocket, room, waitingUser.name, waitingUser.username, false);
                }
                const waitingList = Array.from(room.waitingRoom.values());
                socket.emit("waiting-room-update", { waitingList });
            }
        });

        socket.on("admit-all", () => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            for (const [targetSocketId, waitingUser] of room.waitingRoom.entries()) {
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.leave(`${room.code}:waiting`);
                    targetSocket.emit("admitted-by-host");
                    admitSocketToRoom(targetSocket, room, waitingUser.name, waitingUser.username, false);
                }
            }
            room.waitingRoom.clear();
            socket.emit("waiting-room-update", { waitingList: [] });
        });

        socket.on("deny-user", ({ targetSocketId }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            if (room.waitingRoom.has(targetSocketId)) {
                room.waitingRoom.delete(targetSocketId);
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.emit("denied-by-host", { message: "The host has declined your entry request." });
                    targetSocket.disconnect(true);
                }
                const waitingList = Array.from(room.waitingRoom.values());
                socket.emit("waiting-room-update", { waitingList });
            }
        });

        // 3. WebRTC Perfect Negotiation Signaling
        socket.on("signal", ({ to, signal, polite }) => {
            if (!to || !signal) return;
            io.to(to).emit("signal", {
                from: socket.id,
                signal,
                polite,
            });
        });

        // 4. ICE Restart Request
        socket.on("request-ice-restart", ({ to }) => {
            if (to) {
                io.to(to).emit("request-ice-restart", { from: socket.id });
            }
        });

        // 5. Host Room Controls
        socket.on("toggle-room-lock", ({ locked }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            room.isLocked = !!locked;
            io.to(room.code).emit("room-lock-changed", { isLocked: room.isLocked });
        });

        socket.on("toggle-waiting-room", ({ enabled }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            room.waitingRoomEnabled = !!enabled;
            io.to(room.code).emit("waiting-room-changed", { waitingRoomEnabled: room.waitingRoomEnabled });
        });

        socket.on("mute-participant", ({ targetSocketId }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            io.to(targetSocketId).emit("force-mute");
        });

        socket.on("mute-all", () => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            socket.to(room.code).emit("force-mute");
        });

        socket.on("remove-participant", ({ targetSocketId }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            const targetSocket = io.sockets.sockets.get(targetSocketId);
            if (targetSocket) {
                targetSocket.emit("removed-by-host", { message: "You were removed from the meeting by the host." });
                targetSocket.disconnect(true);
            }
        });

        socket.on("transfer-host", ({ targetSocketId }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            if (room.participants.has(targetSocketId)) {
                room.hostSocketId = targetSocketId;
                const oldHost = room.participants.get(socket.id);
                if (oldHost) oldHost.isHost = false;

                const newHost = room.participants.get(targetSocketId);
                if (newHost) newHost.isHost = true;

                io.to(room.code).emit("host-changed", {
                    newHostSocketId: targetSocketId,
                    participants: Array.from(room.participants.values()),
                });
            }
        });

        socket.on("end-meeting-for-all", () => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostSocketId !== socket.id) return;

            io.to(room.code).emit("meeting-ended-by-host", { message: "The host has ended this meeting for all participants." });
            rooms.delete(currentRoomCode);
        });

        // 6. Media State Broadcast (Mute / Cam / Screen / Speaker)
        socket.on("media-state-changed", ({ isAudioMuted, isVideoMuted, isScreenSharing }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const participant = room.participants.get(socket.id);
            if (participant) {
                participant.isAudioMuted = isAudioMuted;
                participant.isVideoMuted = isVideoMuted;
                participant.isScreenSharing = isScreenSharing;

                socket.to(room.code).emit("participant-media-changed", {
                    socketId: socket.id,
                    isAudioMuted,
                    isVideoMuted,
                    isScreenSharing,
                });
            }
        });

        // Active Speaker Broadcast
        socket.on("active-speaker", ({ isSpeaking, audioLevel }) => {
            if (!currentRoomCode) return;
            socket.to(currentRoomCode).emit("speaker-status", {
                socketId: socket.id,
                isSpeaking,
                audioLevel,
            });
        });

        // 7. Collaboration: Chat & File share
        socket.on("chat-message", ({ message, senderName, isPrivate, toSocketId, fileData }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const chatItem = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                senderSocketId: socket.id,
                senderName: senderName || "Participant",
                message: message || "",
                fileData: fileData || null,
                isPrivate: !!isPrivate,
                toSocketId: toSocketId || null,
                timestamp: new Date().toISOString(),
            };

            if (isPrivate && toSocketId) {
                io.to(toSocketId).emit("chat-message", chatItem);
                socket.emit("chat-message", chatItem);
            } else {
                room.chat.push(chatItem);
                if (room.chat.length > 200) room.chat.shift();
                io.to(room.code).emit("chat-message", chatItem);
            }
        });

        socket.on("typing-indicator", ({ isTyping, name }) => {
            if (!currentRoomCode) return;
            socket.to(currentRoomCode).emit("typing-indicator", {
                socketId: socket.id,
                name,
                isTyping,
            });
        });

        // 8. Reactions & Hand Raise
        socket.on("send-reaction", ({ emoji, name }) => {
            if (!currentRoomCode) return;
            io.to(currentRoomCode).emit("reaction-received", {
                id: `${Date.now()}-${Math.random()}`,
                socketId: socket.id,
                name: name || "Someone",
                emoji,
            });
        });

        socket.on("toggle-hand-raise", ({ raised, name }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const participant = room.participants.get(socket.id);
            if (participant) {
                participant.handRaised = raised;
            }

            io.to(room.code).emit("hand-raise-changed", {
                socketId: socket.id,
                name: name || participant?.name || "Participant",
                raised,
                timestamp: new Date().toISOString(),
            });
        });

        // 9. Polls
        socket.on("create-poll", ({ question, options }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const poll = {
                id: `poll-${Date.now()}`,
                creatorSocketId: socket.id,
                question,
                options: options.map((opt) => ({ text: opt, votes: [] })),
                closed: false,
                createdAt: new Date().toISOString(),
            };

            room.polls.push(poll);
            io.to(room.code).emit("poll-created", poll);
        });

        socket.on("vote-poll", ({ pollId, optionIndex, voterName }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const poll = room.polls.find((p) => p.id === pollId);
            if (poll && !poll.closed) {
                // Remove existing vote by this socket
                poll.options.forEach((opt) => {
                    opt.votes = opt.votes.filter((id) => id !== socket.id);
                });
                if (poll.options[optionIndex]) {
                    poll.options[optionIndex].votes.push(socket.id);
                }
                io.to(room.code).emit("poll-updated", poll);
            }
        });

        // 10. Shared Whiteboard
        socket.on("whiteboard-stroke", (strokeData) => {
            if (!currentRoomCode) return;
            socket.to(currentRoomCode).emit("whiteboard-stroke", strokeData);
        });

        socket.on("whiteboard-clear", () => {
            if (!currentRoomCode) return;
            socket.to(currentRoomCode).emit("whiteboard-clear");
        });

        // 11. Shared Notes
        socket.on("notes-update", ({ notes, updatedBy }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (room) {
                room.notes = notes;
            }
            socket.to(currentRoomCode).emit("notes-update", { notes, updatedBy });
        });

        // 12. Live Captions Broadcast
        socket.on("caption-broadcast", ({ speaker, text, isFinal, lang }) => {
            if (!currentRoomCode) return;
            socket.to(currentRoomCode).emit("caption-broadcast", {
                socketId: socket.id,
                speaker: speaker || "Speaker",
                text,
                isFinal,
                lang,
                timestamp: new Date().toISOString(),
            });
        });

        // 13. Recording State Banner
        socket.on("toggle-recording", ({ isRecording, recorderName }) => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (room) {
                room.isRecording = isRecording;
            }
            io.to(currentRoomCode).emit("recording-state-changed", {
                isRecording,
                recorderName: recorderName || "Participant",
            });
        });

        // 14. Disconnect and Leave Handling
        const handleLeave = () => {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            // Remove from waiting room if present
            if (room.waitingRoom.has(socket.id)) {
                room.waitingRoom.delete(socket.id);
                io.to(room.hostSocketId).emit("waiting-room-update", {
                    waitingList: Array.from(room.waitingRoom.values()),
                });
            }

            // Remove from participants
            if (room.participants.has(socket.id)) {
                room.participants.delete(socket.id);

                // Notify peers
                io.to(room.code).emit("user-left", {
                    socketId: socket.id,
                    participants: Array.from(room.participants.values()),
                });

                // If host left, transfer host to next participant
                if (room.hostSocketId === socket.id && room.participants.size > 0) {
                    const nextHost = room.participants.values().next().value;
                    if (nextHost) {
                        room.hostSocketId = nextHost.socketId;
                        nextHost.isHost = true;
                        io.to(room.code).emit("host-changed", {
                            newHostSocketId: nextHost.socketId,
                            participants: Array.from(room.participants.values()),
                        });
                    }
                }

                // Delete room if completely empty
                if (room.participants.size === 0 && room.waitingRoom.size === 0) {
                    rooms.delete(currentRoomCode);
                }
            }
        };

        socket.on("leave-room", handleLeave);
        socket.on("disconnect", handleLeave);
    });

    return io;
};

