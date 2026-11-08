import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SettingsIcon from '@mui/icons-material/Settings';
import WifiIcon from '@mui/icons-material/Wifi';
import LockIcon from '@mui/icons-material/Lock';
import { AudioMeter } from '../../components/AudioMeter';
import { useActiveSpeaker } from '../../hooks/useActiveSpeaker';
import server from '../../environment';

export const LobbyScreen = ({
  roomCode,
  meetingInfo,
  onJoin,
  defaultName = '',
  mediaDevices,
}) => {
  const [name, setName] = useState(defaultName || localStorage.getItem('streamly_name') || '');
  const [passcode, setPasscode] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [stream, setStream] = useState(null);
  const [pingMs, setPingMs] = useState(null);
  const [networkQuality, setNetworkQuality] = useState('Checking...');
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef(null);

  // Measure server RTT latency
  useEffect(() => {
    let isMounted = true;
    const testPing = async () => {
      const start = performance.now();
      try {
        await fetch(`${server}/api/health`, { cache: 'no-store' });
        const latency = Math.round(performance.now() - start);
        if (isMounted) {
          setPingMs(latency);
          if (latency < 120) {
            setNetworkQuality('Good');
          } else if (latency < 280) {
            setNetworkQuality('Fair');
          } else {
            setNetworkQuality('Weak');
          }
        }
      } catch (err) {
        if (isMounted) {
          setPingMs(999);
          setNetworkQuality('Degraded');
        }
      }
    };

    testPing();
    const interval = setInterval(testPing, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize preview stream
  useEffect(() => {
    let activeStream = null;
    const initPreview = async () => {
      try {
        const s = await mediaDevices.getMediaStream({
          video: isVideoOn,
          audio: isAudioOn,
          videoId: mediaDevices.selectedVideoDevice,
          audioId: mediaDevices.selectedAudioDevice,
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.warn('Lobby preview stream issue:', err);
      }
    };

    initPreview();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isVideoOn, isAudioOn, mediaDevices]);

  // Mic level meter
  const { audioLevel } = useActiveSpeaker(stream, !isAudioOn);

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !isAudioOn;
      });
    }
    setIsAudioOn(!isAudioOn);
  };

  const handleJoinClick = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a display name to continue.');
      return;
    }
    if (meetingInfo?.hasPasscode && !passcode.trim()) {
      setErrorMsg('This meeting requires a passcode.');
      return;
    }

    localStorage.setItem('streamly_name', name.trim());
    onJoin({
      name: name.trim(),
      passcode: passcode.trim(),
      isVideoOn,
      isAudioOn,
      stream,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        p: { xs: 2, md: 5 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow in background */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.85fr' },
          gap: 4,
          maxWidth: '1040px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Column: Video Preview and Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // mirror
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                }}
              >
                <VideocamOffIcon sx={{ fontSize: 64, mb: 1, opacity: 0.4 }} />
                <Typography variant="body1">Camera is off</Typography>
              </Box>
            )}

            {/* Bottom In-Preview Controls */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                px: 2.2,
                py: 1.1,
                borderRadius: 5,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
              }}
            >
              <IconButton
                onClick={toggleAudio}
                sx={{
                  backgroundColor: isAudioOn ? 'rgba(255, 255, 255, 0.1)' : '#ef4444',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: isAudioOn ? 'rgba(255, 255, 255, 0.2)' : '#dc2626',
                  },
                }}
              >
                {isAudioOn ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              <IconButton
                onClick={toggleVideo}
                sx={{
                  backgroundColor: isVideoOn ? 'rgba(255, 255, 255, 0.1)' : '#ef4444',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: isVideoOn ? 'rgba(255, 255, 255, 0.2)' : '#dc2626',
                  },
                }}
              >
                {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton
                onClick={() => setShowSettings(!showSettings)}
                sx={{
                  backgroundColor: showSettings ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>

            {/* Mic Meter Pill */}
            {isAudioOn && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(10px)',
                  px: 1.6,
                  py: 0.7,
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <MicIcon sx={{ fontSize: 16, color: '#10b981' }} />
                <AudioMeter level={audioLevel} width={75} height={5} />
              </Box>
            )}

            {/* Network Quality Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                px: 1.6,
                py: 0.7,
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <WifiIcon
                sx={{
                  fontSize: 16,
                  color: networkQuality === 'Good' ? '#10b981' : networkQuality === 'Fair' ? '#f59e0b' : '#ef4444',
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {networkQuality} {pingMs ? `(${pingMs}ms)` : ''}
              </Typography>
            </Box>
          </Box>

          {/* Device Settings Panel */}
          {showSettings && (
            <Paper
              sx={{
                p: 3,
                borderRadius: 3.5,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'primary.light', fontWeight: 700 }}>
                Device Configuration
              </Typography>

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: 'text.secondary' }}>Microphone</InputLabel>
                <Select
                  value={mediaDevices.selectedAudioDevice || ''}
                  label="Microphone"
                  onChange={(e) => mediaDevices.setSelectedAudioDevice(e.target.value)}
                  sx={{ color: '#fff', borderRadius: 2 }}
                >
                  {mediaDevices.audioDevices.map((d) => (
                    <MenuItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: 'text.secondary' }}>Camera</InputLabel>
                <Select
                  value={mediaDevices.selectedVideoDevice || ''}
                  label="Camera"
                  onChange={(e) => mediaDevices.setSelectedVideoDevice(e.target.value)}
                  sx={{ color: '#fff', borderRadius: 2 }}
                >
                  {mediaDevices.videoDevices.map((d) => (
                    <MenuItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}
        </Box>

        {/* Right Column: Meeting Info and Join Form */}
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: 4,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box sx={{ mb: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Chip
                label={roomCode}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: 'primary.light',
                  px: 0.5,
                }}
              />
              {meetingInfo?.hasPasscode && (
                <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Password Protected" size="small" color="warning" />
              )}
            </Box>

            <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
              {meetingInfo?.title || 'Ready to join?'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.8 }}>
              Verify your camera and microphone, set your display name, and join the room.
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleJoinClick} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Your Display Name"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              InputLabelProps={{ sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2.5 } }}
            />

            {meetingInfo?.hasPasscode && (
              <TextField
                label="Meeting Passcode"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                InputLabelProps={{ sx: { color: 'text.secondary' } }}
                InputProps={{ sx: { color: '#fff', borderRadius: 2.5 } }}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.6,
                fontSize: '1.05rem',
                fontWeight: 700,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                mt: 1,
              }}
            >
              Join Meeting Now
            </Button>
          </Box>

          <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              🔒 P2P Encrypted • Zero Server Media Storage • No App Downloads
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
