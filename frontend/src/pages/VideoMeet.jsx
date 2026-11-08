import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import confetti from 'canvas-confetti';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import server from '../environment';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PeerManager } from '../services/PeerManager';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useActiveSpeaker } from '../hooks/useActiveSpeaker';
import { useNetworkStats } from '../hooks/useNetworkStats';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useShortcuts } from '../hooks/useShortcuts';
import { playSound } from '../utils/soundEffects';
import { LocalRecorder } from '../utils/recordingHelper';

import { LobbyScreen } from '../features/lobby/LobbyScreen';
import { VideoTile } from '../features/room/VideoTile';
import { ControlsBar } from '../features/room/ControlsBar';
import { ChatPanel } from '../features/chat/ChatPanel';
import { WhiteboardPanel } from '../features/whiteboard/WhiteboardPanel';
import { NotesPanel } from '../features/notes/NotesPanel';
import { PollsPanel } from '../features/polls/PollsPanel';
import { ParticipantsPanel } from '../features/room/ParticipantsPanel';
import { ShortcutModal } from '../components/ShortcutModal';

export default function VideoMeet() {
  const { url: routeCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roomCode = (routeCode || 'instant-room').toLowerCase().trim();

  // Pre-join & Room State
  const [inLobby, setInLobby] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [isWaitingForHost, setIsWaitingForHost] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('');
  const [roomLockedMsg, setRoomLockedMsg] = useState('');

  // Local Participant State
  const [displayName, setDisplayName] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(false);

  // Active Layout & Panels
  const [pinnedId, setPinnedId] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // 'chat' | 'participants' | 'whiteboard' | 'notes' | 'polls' | null
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Call Data
  const [participants, setParticipants] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState(new Map()); // socketId -> MediaStream
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sharedNotes, setSharedNotes] = useState('');
  const [polls, setPolls] = useState([]);
  const [whiteboardStroke, setWhiteboardStroke] = useState(null);
  const [liveCaptions, setLiveCaptions] = useState([]); // [{ speaker, text, timestamp }]
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [recordingBanner, setRecordingBanner] = useState({ active: false, recorderName: '' });

  // Refs
  const socketRef = useRef(null);
  const peerManagerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const cameraVideoTrackRef = useRef(null);
  const recorderRef = useRef(new LocalRecorder());
  const meetingStartTimeRef = useRef(Date.now());

  // Media Devices Hook
  const mediaDevices = useMediaDevices();

  // Active Speaker Hook for Local Stream
  const { audioLevel: localAudioLevel, isSpeaking: isLocalSpeaking } = useActiveSpeaker(
    localStreamRef.current,
    isAudioMuted
  );

  // Live Captions Hook
  const {
    startListening,
    stopListening,
    currentCaption,
    transcript,
    addRemoteCaption,
  } = useSpeechRecognition({
    speakerName: displayName,
    onCaptionGenerated: (caption) => {
      socketRef.current?.emit('caption-broadcast', caption);
    },
  });

  // Network stats
  const { networkStats } = useNetworkStats(peerManagerRef.current?.peers, () => {
    setToastMessage('High latency detected. Enabling Low-Bandwidth Mode.');
    handleToggleLowBandwidth(true);
  });

  // Fetch meeting info on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInfo = async () => {
      try {
        const { data } = await api.get(`/meetings/${roomCode}`);
        if (isMounted) setMeetingInfo(data);
      } catch (err) {
        console.warn('Could not fetch meeting info:', err);
      }
    };
    fetchInfo();
    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  // Sync local speaking state to socket
  useEffect(() => {
    if (socketRef.current && !inLobby) {
      socketRef.current.emit('active-speaker', {
        isSpeaking: isLocalSpeaking,
        audioLevel: localAudioLevel,
      });
    }
  }, [isLocalSpeaking, localAudioLevel, inLobby]);

  // Clean disconnect and save artifacts on leaving
  const saveMeetingSummary = useCallback(async () => {
    try {
      const durationSeconds = Math.round((Date.now() - meetingStartTimeRef.current) / 1000);
      await api.post(`/meetings/${roomCode}/artifacts`, {
        transcript,
        chat: chatMessages,
        notes: sharedNotes,
        polls,
        durationSeconds,
      });
    } catch (e) {
      console.warn('Failed to auto-save meeting artifacts:', e);
    }
  }, [roomCode, transcript, chatMessages, sharedNotes, polls]);

  // Join handler called from LobbyScreen
  const handleJoinFromLobby = async ({ name, isVideoOn, isAudioOn, stream }) => {
    setDisplayName(name);
    setIsVideoOff(!isVideoOn);
    setIsAudioMuted(!isAudioOn);
    localStreamRef.current = stream;

    // Cache camera video track for screen-share toggling
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      cameraVideoTrackRef.current = videoTrack;
    }

    // Connect to Socket server
    const socket = io(server, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    // Initialize PeerManager
    const pm = new PeerManager({
      myId: socket.id,
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      onSignal: (toId, signal, polite) => {
        socket.emit('signal', { to: toId, signal, polite });
      },
      onRemoteTrack: (peerId, track, remoteStream) => {
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.set(peerId, remoteStream);
          return updated;
        });
      },
      onConnectionStateChange: (peerId, state) => {
        console.log(`[Peer ${peerId}] State: ${state}`);
      },
    });

    if (stream) {
      pm.setLocalStream(stream);
    }
    peerManagerRef.current = pm;

    // Socket Event Listeners
    socket.on('connect', () => {
      pm.myId = socket.id;
      socket.emit('join-room', {
        roomCode,
        name,
        username: user?.username || 'guest',
        isHostRequested: false,
      });
    });

    socket.on('room-joined', (data) => {
      setInLobby(false);
      setIsWaitingForHost(false);
      setIsHost(data.isHost);
      setIsRoomLocked(data.isLocked);
      setIsWaitingRoomEnabled(data.waitingRoomEnabled);
      setParticipants(data.participants || []);
      setChatMessages(data.chat || []);
      setSharedNotes(data.notes || '');
      setPolls(data.polls || []);
      if (data.iceServers) {
        pm.setIceServers(data.iceServers);
      }
      playSound('join');
    });

    socket.on('waiting-for-host', (data) => {
      setIsWaitingForHost(true);
      setWaitingMessage(data.message);
    });

    socket.on('admitted-by-host', () => {
      setIsWaitingForHost(false);
      setInLobby(false);
      playSound('join');
    });

    socket.on('denied-by-host', (data) => {
      setIsWaitingForHost(false);
      setRoomLockedMsg(data.message || 'Entry denied by host.');
    });

    socket.on('room-locked', (data) => {
      setRoomLockedMsg(data.message);
    });

    socket.on('waiting-room-update', ({ waitingList }) => {
      setWaitingList(waitingList || []);
      if (waitingList?.length > 0) {
        playSound('message');
      }
    });

    socket.on('user-joined', ({ newParticipant, participants }) => {
      setParticipants(participants || []);
      playSound('join');
      // Create peer connection
      pm.getOrCreatePeer(newParticipant.socketId);
    });

    socket.on('user-left', ({ socketId, participants }) => {
      setParticipants(participants || []);
      pm.removePeer(socketId);
      setRemoteStreams((prev) => {
        const updated = new Map(prev);
        updated.delete(socketId);
        return updated;
      });
      playSound('leave');
    });

    socket.on('signal', ({ from, signal, polite }) => {
      pm.handleSignal(from, signal, polite);
    });

    socket.on('participant-media-changed', ({ socketId, isAudioMuted, isVideoMuted, isScreenSharing }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === socketId
            ? { ...p, isAudioMuted, isVideoMuted, isScreenSharing }
            : p
        )
      );
    });

    socket.on('force-mute', () => {
      handleToggleAudio(true);
      setToastMessage('You have been muted by the host.');
    });

    socket.on('removed-by-host', () => {
      alert('You were removed from this meeting by the host.');
      handleLeave();
    });

    socket.on('host-changed', ({ newHostSocketId, participants }) => {
      setParticipants(participants);
      setIsHost(socket.id === newHostSocketId);
      setToastMessage('Meeting host has changed.');
    });

    socket.on('meeting-ended-by-host', () => {
      alert('The host has ended this meeting.');
      handleLeave();
    });

    socket.on('room-lock-changed', ({ isLocked }) => {
      setIsRoomLocked(isLocked);
      setToastMessage(isLocked ? 'Room has been locked.' : 'Room unlocked.');
    });

    socket.on('waiting-room-changed', ({ waitingRoomEnabled }) => {
      setIsWaitingRoomEnabled(waitingRoomEnabled);
      setToastMessage(waitingRoomEnabled ? 'Waiting room enabled.' : 'Waiting room disabled.');
    });

    socket.on('chat-message', (chatItem) => {
      setChatMessages((prev) => [...prev, chatItem]);
      if (activePanel !== 'chat') {
        setUnreadCount((prev) => prev + 1);
        playSound('message');
      }
    });

    socket.on('typing-indicator', ({ name, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(name) ? prev : [...prev, name];
        } else {
          return prev.filter((n) => n !== name);
        }
      });
    });

    socket.on('reaction-received', ({ emoji, name }) => {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
      setToastMessage(`${name}: ${emoji}`);
    });

    socket.on('hand-raise-changed', ({ socketId, name, raised }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, handRaised: raised } : p))
      );
      if (raised) {
        playSound('hand');
        setToastMessage(`${name} raised their hand.`);
      }
    });

    socket.on('poll-created', (poll) => {
      setPolls((prev) => [...prev, poll]);
      playSound('message');
      setToastMessage('A new poll has been launched!');
    });

    socket.on('poll-updated', (updatedPoll) => {
      setPolls((prev) => prev.map((p) => (p.id === updatedPoll.id ? updatedPoll : p)));
    });

    socket.on('whiteboard-stroke', (stroke) => {
      setWhiteboardStroke(stroke);
    });

    socket.on('whiteboard-clear', () => {
      setWhiteboardStroke({ clear: true });
    });

    socket.on('notes-update', ({ notes }) => {
      setSharedNotes(notes);
    });

    socket.on('caption-broadcast', (caption) => {
      addRemoteCaption(caption);
      setLiveCaptions((prev) => [...prev.slice(-3), caption]);
    });

    socket.on('recording-state-changed', ({ isRecording, recorderName }) => {
      setRecordingBanner({ active: isRecording, recorderName });
      playSound('message');
    });
  };

  // Toggle Mute
  const handleToggleAudio = (forceState) => {
    const nextState = forceState !== undefined ? forceState : !isAudioMuted;
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextState;
      });
    }
    setIsAudioMuted(nextState);
    socketRef.current?.emit('media-state-changed', {
      isAudioMuted: nextState,
      isVideoMuted: isVideoOff,
      isScreenSharing,
    });
  };

  // Toggle Video
  const handleToggleVideo = () => {
    const nextState = !isVideoOff;
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !nextState;
      });
    }
    setIsVideoOff(nextState);
    socketRef.current?.emit('media-state-changed', {
      isAudioMuted,
      isVideoMuted: nextState,
      isScreenSharing,
    });
  };

  // Screen Share Toggle
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share and restore camera
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      if (cameraVideoTrackRef.current && peerManagerRef.current) {
        await peerManagerRef.current.replaceVideoTrack(cameraVideoTrackRef.current);
      }
      setIsScreenSharing(false);
      socketRef.current?.emit('media-state-changed', {
        isAudioMuted,
        isVideoMuted: isVideoOff,
        isScreenSharing: false,
      });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true,
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        screenTrack.onended = () => {
          handleToggleScreenShare();
        };

        if (peerManagerRef.current) {
          await peerManagerRef.current.replaceVideoTrack(screenTrack);
        }

        setIsScreenSharing(true);
        socketRef.current?.emit('media-state-changed', {
          isAudioMuted,
          isVideoMuted: false,
          isScreenSharing: true,
        });
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  };

  // Low-Bandwidth Mode Toggle
  const handleToggleLowBandwidth = (forceState) => {
    const nextState = forceState !== undefined ? forceState : !isLowBandwidth;
    setIsLowBandwidth(nextState);
    if (peerManagerRef.current) {
      peerManagerRef.current.setLowBandwidthMode(nextState);
    }
    setToastMessage(nextState ? 'Low-bandwidth mode enabled (360p / audio prioritized)' : 'Standard video quality restored');
  };

  // Captions Toggle
  const handleToggleCaptions = () => {
    if (isCaptionsOn) {
      stopListening();
      setIsCaptionsOn(false);
    } else {
      const started = startListening();
      if (started) {
        setIsCaptionsOn(true);
        setToastMessage('Live captions active (transcribing to meeting record)');
      } else {
        setToastMessage('Speech recognition is not supported in this browser.');
      }
    }
  };

  // Local Recording Toggle
  const handleToggleRecording = () => {
    if (isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
      socketRef.current?.emit('toggle-recording', { isRecording: false, recorderName: displayName });
      setToastMessage('Recording stopped and downloaded to your device.');
    } else {
      if (!localStreamRef.current) return;
      try {
        recorderRef.current.start(localStreamRef.current, roomCode);
        setIsRecording(true);
        socketRef.current?.emit('toggle-recording', { isRecording: true, recorderName: displayName });
        setToastMessage('Recording started. Composite stream is recording locally.');
      } catch (err) {
        alert('Could not start recording in this browser.');
      }
    }
  };

  // Hand Raise Toggle
  const handleToggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    socketRef.current?.emit('toggle-hand-raise', { raised: nextState, name: displayName });
  };

  // Send Floating Reaction
  const handleSendReaction = (emoji) => {
    socketRef.current?.emit('send-reaction', { emoji, name: displayName });
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.8 },
    });
  };

  // Chat message send
  const handleSendMessage = ({ message, isPrivate, toSocketId, fileData }) => {
    socketRef.current?.emit('chat-message', {
      message,
      senderName: displayName,
      isPrivate,
      toSocketId,
      fileData,
    });
  };

  // Leave and Cleanup
  const handleLeave = async () => {
    await saveMeetingSummary();
    socketRef.current?.emit('leave-room');
    socketRef.current?.disconnect();
    peerManagerRef.current?.destroy();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    navigate('/home');
  };

  const handleEndMeetingForAll = () => {
    socketRef.current?.emit('end-meeting-for-all');
    handleLeave();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      peerManagerRef.current?.destroy();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Keyboard Shortcuts Hook
  useShortcuts({
    onToggleMute: () => handleToggleAudio(),
    onToggleVideo: () => handleToggleVideo(),
    onToggleScreenShare: () => handleToggleScreenShare(),
    onToggleChat: () => setActivePanel((p) => (p === 'chat' ? null : 'chat')),
    onToggleHandRaise: () => handleToggleHandRaise(),
    onToggleParticipants: () => setActivePanel((p) => (p === 'participants' ? null : 'participants')),
    onOpenHelp: () => setShowShortcuts(true),
    enabled: !inLobby,
  });

  // 1. Waiting for Host Screen
  if (isWaitingForHost) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: '#fff',
          p: 3,
          textAlign: 'center',
        }}
      >
        <CircularProgress size={56} sx={{ color: 'primary.light', mb: 3 }} />
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Waiting for the host to admit you...
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mb: 3 }}>
          {waitingMessage || 'The host has enabled a waiting room. You will join the call as soon as they approve your request.'}
        </Typography>
        <Chip label={`Room: ${roomCode}`} sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
      </Box>
    );
  }

  // 2. Room Locked or Error Screen
  if (roomLockedMsg) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: '#fff',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
          {roomLockedMsg}
        </Alert>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          You can try rejoining or return to the home screen.
        </Typography>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </button>
      </Box>
    );
  }

  // 3. Pre-join Lobby
  if (inLobby) {
    return (
      <LobbyScreen
        roomCode={roomCode}
        meetingInfo={meetingInfo}
        defaultName={user?.name || ''}
        mediaDevices={mediaDevices}
        onJoin={handleJoinFromLobby}
      />
    );
  }

  // 4. In-Call View
  // Compute Grid layout dimensions
  const remotePeerIds = Array.from(remoteStreams.keys());
  const totalTiles = 1 + remotePeerIds.length; // Local + Remotes

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Bar: Room Code, Recording Banner, & Lock Status */}
      <Box
        sx={{
          height: 48,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.light' }}>
            Streamly
          </Typography>
          <Chip
            label={roomCode}
            size="small"
            sx={{
              height: 22,
              fontFamily: 'monospace',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
            }}
          />
          {isRoomLocked && (
            <Chip label="🔒 Locked" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
          {isLowBandwidth && (
            <Chip label="⚡ Low-Bandwidth" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>

        {/* Recording Banner */}
        {recordingBanner.active && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#ef4444' }}>
            <FiberManualRecordIcon sx={{ fontSize: 14, animation: 'pulse 1.2s infinite' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              RECORDING ({recordingBanner.recorderName})
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {participants.length} connected
          </Typography>
        </Box>
      </Box>

      {/* Main Body: Video Gallery + Slide-in Side Panel */}
      <Box sx={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Video Canvas Gallery */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Spotlight / Pin Layout */}
          {pinnedId || isScreenSharing ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', gap: 2 }}>
              {/* Primary Large Tile */}
              <Box sx={{ flex: 1, height: '100%' }}>
                {pinnedId === 'local' || (!pinnedId && isScreenSharing) ? (
                  <VideoTile
                    stream={localStreamRef.current}
                    name={displayName}
                    isLocal={true}
                    isMuted={isAudioMuted}
                    isVideoOff={isVideoOff}
                    isSpeaking={isLocalSpeaking}
                    isPinned={true}
                    isHandRaised={isHandRaised}
                    onTogglePin={() => setPinnedId(null)}
                  />
                ) : (
                  <VideoTile
                    stream={remoteStreams.get(pinnedId)}
                    name={participants.find((p) => p.socketId === pinnedId)?.name || 'Participant'}
                    isLocal={false}
                    isMuted={participants.find((p) => p.socketId === pinnedId)?.isAudioMuted}
                    isVideoOff={participants.find((p) => p.socketId === pinnedId)?.isVideoMuted}
                    isPinned={true}
                    networkQuality={networkStats[pinnedId]?.rating || 3}
                    rtt={networkStats[pinnedId]?.rtt || 0}
                    packetLoss={networkStats[pinnedId]?.packetLoss || 0}
                    onTogglePin={() => setPinnedId(null)}
                  />
                )}
              </Box>

              {/* Sidebar Strip */}
              <Box
                sx={{
                  width: { xs: 120, sm: 200 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  overflowY: 'auto',
                }}
              >
                {/* Local Tile in strip if not pinned */}
                {pinnedId !== 'local' && (
                  <Box sx={{ height: 130 }}>
                    <VideoTile
                      stream={localStreamRef.current}
                      name={displayName}
                      isLocal={true}
                      isMuted={isAudioMuted}
                      isVideoOff={isVideoOff}
                      isSpeaking={isLocalSpeaking}
                      onTogglePin={() => setPinnedId('local')}
                    />
                  </Box>
                )}

                {/* Remotes in strip */}
                {remotePeerIds
                  .filter((id) => id !== pinnedId)
                  .map((peerId) => {
                    const p = participants.find((x) => x.socketId === peerId);
                    return (
                      <Box key={peerId} sx={{ height: 130 }}>
                        <VideoTile
                          stream={remoteStreams.get(peerId)}
                          name={p?.name || 'Participant'}
                          isLocal={false}
                          isMuted={p?.isAudioMuted}
                          isVideoOff={p?.isVideoMuted}
                          isHandRaised={p?.handRaised}
                          networkQuality={networkStats[peerId]?.rating || 3}
                          rtt={networkStats[peerId]?.rtt || 0}
                          packetLoss={networkStats[peerId]?.packetLoss || 0}
                          onTogglePin={() => setPinnedId(peerId)}
                        />
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          ) : (
            /* Responsive Grid Layout */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gap: { xs: 1, sm: 2 },
                gridTemplateColumns:
                  totalTiles === 1
                    ? '1fr'
                    : totalTiles === 2
                    ? { xs: '1fr', sm: '1fr 1fr' }
                    : totalTiles <= 4
                    ? { xs: '1fr 1fr', sm: '1fr 1fr' }
                    : { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                gridTemplateRows:
                  totalTiles <= 2
                    ? '1fr'
                    : totalTiles <= 4
                    ? '1fr 1fr'
                    : '1fr 1fr',
                maxHeight: 'calc(100vh - 120px)',
              }}
            >
              {/* Local Participant Tile */}
              <VideoTile
                stream={localStreamRef.current}
                name={displayName}
                isLocal={true}
                isMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                isSpeaking={isLocalSpeaking}
                isHandRaised={isHandRaised}
                onTogglePin={() => setPinnedId('local')}
              />

              {/* Remote Participants Tiles */}
              {remotePeerIds.map((peerId) => {
                const p = participants.find((x) => x.socketId === peerId);
                return (
                  <VideoTile
                    key={peerId}
                    stream={remoteStreams.get(peerId)}
                    name={p?.name || 'Participant'}
                    isLocal={false}
                    isMuted={p?.isAudioMuted}
                    isVideoOff={p?.isVideoMuted}
                    isHandRaised={p?.handRaised}
                    networkQuality={networkStats[peerId]?.rating || 3}
                    rtt={networkStats[peerId]?.rtt || 0}
                    packetLoss={networkStats[peerId]?.packetLoss || 0}
                    onTogglePin={() => setPinnedId(peerId)}
                  />
                );
              })}
            </Box>
          )}

          {/* Live Captions Floating Overlay */}
          {(isCaptionsOn || liveCaptions.length > 0) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 80, sm: 90 },
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '80%',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                px: 2.5,
                py: 1,
                borderRadius: 3,
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {currentCaption || liveCaptions[liveCaptions.length - 1]?.text || 'Listening for speech...'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Slide-in Collaboration Panels */}
        {activePanel === 'chat' && (
          <ChatPanel
            messages={chatMessages}
            participants={participants}
            currentSocketId={socketRef.current?.id}
            myDisplayName={displayName}
            onSendMessage={handleSendMessage}
            onTyping={(isTyping) =>
              socketRef.current?.emit('typing-indicator', { isTyping, name: displayName })
            }
            typingUsers={typingUsers}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'participants' && (
          <ParticipantsPanel
            participants={participants}
            waitingList={waitingList}
            currentSocketId={socketRef.current?.id}
            isHost={isHost}
            onMuteParticipant={(targetSocketId) =>
              socketRef.current?.emit('mute-participant', { targetSocketId })
            }
            onRemoveParticipant={(targetSocketId) =>
              socketRef.current?.emit('remove-participant', { targetSocketId })
            }
            onTransferHost={(targetSocketId) =>
              socketRef.current?.emit('transfer-host', { targetSocketId })
            }
            onMuteAll={() => socketRef.current?.emit('mute-all')}
            onAdmitUser={(targetSocketId) =>
              socketRef.current?.emit('admit-user', { targetSocketId })
            }
            onDenyUser={(targetSocketId) =>
              socketRef.current?.emit('deny-user', { targetSocketId })
            }
            onAdmitAll={() => socketRef.current?.emit('admit-all')}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'whiteboard' && (
          <WhiteboardPanel
            externalStrokes={whiteboardStroke}
            onStroke={(stroke) => socketRef.current?.emit('whiteboard-stroke', stroke)}
            onClear={() => socketRef.current?.emit('whiteboard-clear')}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'notes' && (
          <NotesPanel
            initialNotes={sharedNotes}
            externalNotes={sharedNotes}
            roomCode={roomCode}
            onUpdateNotes={(notes) =>
              socketRef.current?.emit('notes-update', { notes, updatedBy: displayName })
            }
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'polls' && (
          <PollsPanel
            polls={polls}
            currentSocketId={socketRef.current?.id}
            isHost={isHost}
            onCreatePoll={(poll) => socketRef.current?.emit('create-poll', poll)}
            onVotePoll={(pollId, optionIndex) =>
              socketRef.current?.emit('vote-poll', { pollId, optionIndex, voterName: displayName })
            }
            onClose={() => setActivePanel(null)}
          />
        )}
      </Box>

      {/* Floating Bottom Controls Bar */}
      <ControlsBar
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isLowBandwidth={isLowBandwidth}
        isCaptionsOn={isCaptionsOn}
        isRecording={isRecording}
        isHandRaised={isHandRaised}
        activePanel={activePanel}
        unreadCount={unreadCount}
        waitingCount={waitingList.length}
        participantCount={participants.length}
        isHost={isHost}
        isRoomLocked={isRoomLocked}
        isWaitingRoomEnabled={isWaitingRoomEnabled}
        onToggleAudio={() => handleToggleAudio()}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleLowBandwidth={() => handleToggleLowBandwidth()}
        onToggleCaptions={handleToggleCaptions}
        onToggleRecording={handleToggleRecording}
        onToggleHandRaise={handleToggleHandRaise}
        onSendReaction={handleSendReaction}
        onTogglePanel={(panel) => {
          setActivePanel((prev) => (prev === panel ? null : panel));
          if (panel === 'chat') setUnreadCount(0);
        }}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onToggleRoomLock={(locked) => socketRef.current?.emit('toggle-room-lock', { locked })}
        onToggleWaitingRoom={(enabled) =>
          socketRef.current?.emit('toggle-waiting-room', { enabled })
        }
        onMuteAll={() => socketRef.current?.emit('mute-all')}
        onLeaveMeeting={handleLeave}
        onEndMeetingForAll={handleEndMeetingForAll}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3500}
        onClose={() => setToastMessage('')}
        message={toastMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
