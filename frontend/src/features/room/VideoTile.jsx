import React, { useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Avatar, Tooltip } from '@mui/material';
import MicOffIcon from '@mui/icons-material/MicOff';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import BackHandIcon from '@mui/icons-material/BackHand';
import { QualityBadge } from '../../components/QualityBadge';

export const VideoTile = ({
  stream,
  name = 'Participant',
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  isPinned = false,
  isHandRaised = false,
  networkQuality = 3,
  rtt = 0,
  packetLoss = 0,
  onTogglePin,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handlePiP = async (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'P';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#111827',
        borderRadius: 3,
        overflow: 'hidden',
        border: isSpeaking
          ? '2px solid #10b981'
          : isPinned
          ? '2px solid #6366f1'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isSpeaking
          ? '0 0 15px rgba(16, 185, 129, 0.35)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        transition: 'all 200ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video element to avoid audio feedback
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isVideoOff ? 'none' : 'block',
          transform: isLocal ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Fallback Avatar when Video is Off */}
      {isVideoOff && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: isLocal ? 'primary.main' : 'secondary.main',
              fontSize: '1.75rem',
              fontWeight: 700,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            }}
          >
            {initials}
          </Avatar>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {name} {isLocal ? '(You)' : ''}
          </Typography>
        </Box>
      )}

      {/* Hand Raised Banner */}
      {isHandRaised && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backgroundColor: '#f59e0b',
            color: '#000',
            px: 1,
            py: 0.4,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <BackHandIcon sx={{ fontSize: 14 }} />
          Hand Raised
        </Box>
      )}

      {/* Top-Right Action Buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          opacity: 0.85,
          '&:hover': { opacity: 1 },
        }}
      >
        {!isLocal && onTogglePin && (
          <Tooltip title={isPinned ? 'Unpin' : 'Pin to primary view'}>
            <IconButton
              size="small"
              onClick={onTogglePin}
              sx={{
                color: isPinned ? 'primary.light' : '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}

        {!isVideoOff && document.pictureInPictureEnabled && (
          <Tooltip title="Picture-in-Picture">
            <IconButton
              size="small"
              onClick={handlePiP}
              sx={{
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <PictureInPictureAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Bottom Label Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            px: 1.2,
            py: 0.4,
            borderRadius: 2,
            maxWidth: '75%',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#fff',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name} {isLocal ? '(You)' : ''}
          </Typography>

          {isMuted && <MicOffIcon sx={{ fontSize: 14, color: '#ef4444' }} />}
        </Box>

        {/* Network Quality Badge */}
        {!isLocal && (
          <Box sx={{ pointerEvents: 'auto' }}>
            <QualityBadge rating={networkQuality} rtt={rtt} packetLoss={packetLoss} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

