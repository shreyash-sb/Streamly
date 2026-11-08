import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import BrushIcon from '@mui/icons-material/Brush';
import DescriptionIcon from '@mui/icons-material/Description';
import PollIcon from '@mui/icons-material/Poll';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import ClosedCaptionDisabledIcon from '@mui/icons-material/ClosedCaptionDisabled';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import BackHandIcon from '@mui/icons-material/BackHand';
import MoodIcon from '@mui/icons-material/Mood';
import CallEndIcon from '@mui/icons-material/CallEnd';
import SecurityIcon from '@mui/icons-material/Security';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

export const ControlsBar = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isLowBandwidth,
  isCaptionsOn,
  isRecording,
  isHandRaised,
  activePanel,
  unreadCount = 0,
  waitingCount = 0,
  participantCount = 1,
  isHost = false,
  isRoomLocked = false,
  isWaitingRoomEnabled = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleLowBandwidth,
  onToggleCaptions,
  onToggleRecording,
  onToggleHandRaise,
  onSendReaction,
  onTogglePanel,
  onOpenShortcuts,
  onToggleRoomLock,
  onToggleWaitingRoom,
  onMuteAll,
  onLeaveMeeting,
  onEndMeetingForAll,
}) => {
  const [reactionAnchor, setReactionAnchor] = useState(null);
  const [securityAnchor, setSecurityAnchor] = useState(null);
  const [leaveAnchor, setLeaveAnchor] = useState(null);

  const emojis = ['👍', '👏', '❤️', '🎉', '🔥', '😂', '💡', '👋'];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 8, md: 16 },
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.8, sm: 1.2 },
        padding: { xs: '6px 12px', sm: '8px 20px' },
        borderRadius: 5,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
        zIndex: 1200,
        maxWidth: '96vw',
        overflowX: 'auto',
      }}
    >
      {/* Mic Toggle */}
      <Tooltip title={isAudioMuted ? 'Unmute (M)' : 'Mute (M)'}>
        <IconButton
          onClick={onToggleAudio}
          sx={{
            backgroundColor: isAudioMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: isAudioMuted ? '#dc2626' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
      </Tooltip>

      {/* Video Toggle */}
      <Tooltip title={isVideoOff ? 'Start Camera (V)' : 'Stop Camera (V)'}>
        <IconButton
          onClick={onToggleVideo}
          sx={{
            backgroundColor: isVideoOff ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: isVideoOff ? '#dc2626' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
        </IconButton>
      </Tooltip>

      {/* Screen Share */}
      <Tooltip title={isScreenSharing ? 'Stop Screen Share (S)' : 'Share Screen (S)'}>
        <IconButton
          onClick={onToggleScreenShare}
          sx={{
            backgroundColor: isScreenSharing ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: isScreenSharing ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        </IconButton>
      </Tooltip>

      {/* Low-Bandwidth Mode */}
      <Tooltip title={isLowBandwidth ? 'Low-Bandwidth Mode Active' : 'Toggle Low-Bandwidth (360p / audio-save)'}>
        <IconButton
          onClick={onToggleLowBandwidth}
          sx={{
            backgroundColor: isLowBandwidth ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
            color: isLowBandwidth ? '#000' : '#fff',
            '&:hover': { backgroundColor: isLowBandwidth ? '#d97706' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <NetworkCheckIcon />
        </IconButton>
      </Tooltip>

      {/* Live Captions Toggle */}
      <Tooltip title={isCaptionsOn ? 'Turn Off Captions' : 'Turn On Live Captions'}>
        <IconButton
          onClick={onToggleCaptions}
          sx={{
            backgroundColor: isCaptionsOn ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: isCaptionsOn ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          {isCaptionsOn ? <ClosedCaptionIcon /> : <ClosedCaptionDisabledIcon />}
        </IconButton>
      </Tooltip>

      {/* Raise Hand Toggle */}
      <Tooltip title={isHandRaised ? 'Lower Hand (H)' : 'Raise Hand (H)'}>
        <IconButton
          onClick={onToggleHandRaise}
          sx={{
            backgroundColor: isHandRaised ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
            color: isHandRaised ? '#000' : '#fff',
            '&:hover': { backgroundColor: isHandRaised ? '#d97706' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <BackHandIcon />
        </IconButton>
      </Tooltip>

      {/* Emoji Reactions */}
      <Tooltip title="Send Reaction">
        <IconButton
          onClick={(e) => setReactionAnchor(e.currentTarget)}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <MoodIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={reactionAnchor}
        open={Boolean(reactionAnchor)}
        onClose={() => setReactionAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: '#1e293b',
            color: '#fff',
            p: 1,
            borderRadius: 3,
            display: 'flex',
            gap: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {emojis.map((emoji) => (
            <Button
              key={emoji}
              onClick={() => {
                onSendReaction(emoji);
                setReactionAnchor(null);
              }}
              sx={{ minWidth: 38, fontSize: '1.25rem', p: 0.5 }}
            >
              {emoji}
            </Button>
          ))}
        </Box>
      </Menu>

      <Box sx={{ width: '1px', height: 24, backgroundColor: 'rgba(255, 255, 255, 0.15)', mx: 0.5 }} />

      {/* Chat Panel Toggle */}
      <Tooltip title="Chat (C)">
        <IconButton
          onClick={() => onTogglePanel('chat')}
          sx={{
            backgroundColor: activePanel === 'chat' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: activePanel === 'chat' ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Participants Panel Toggle */}
      <Tooltip title="Participants (P)">
        <IconButton
          onClick={() => onTogglePanel('participants')}
          sx={{
            backgroundColor: activePanel === 'participants' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: activePanel === 'participants' ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <Badge badgeContent={waitingCount > 0 ? waitingCount : participantCount} color={waitingCount > 0 ? 'warning' : 'primary'}>
            <PeopleIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Whiteboard Toggle */}
      <Tooltip title="Shared Whiteboard">
        <IconButton
          onClick={() => onTogglePanel('whiteboard')}
          sx={{
            backgroundColor: activePanel === 'whiteboard' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: activePanel === 'whiteboard' ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <BrushIcon />
        </IconButton>
      </Tooltip>

      {/* Shared Notes Toggle */}
      <Tooltip title="Collaborative Notes">
        <IconButton
          onClick={() => onTogglePanel('notes')}
          sx={{
            backgroundColor: activePanel === 'notes' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: activePanel === 'notes' ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <DescriptionIcon />
        </IconButton>
      </Tooltip>

      {/* Polls Toggle */}
      <Tooltip title="Live Polls">
        <IconButton
          onClick={() => onTogglePanel('polls')}
          sx={{
            backgroundColor: activePanel === 'polls' ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: activePanel === 'polls' ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <PollIcon />
        </IconButton>
      </Tooltip>

      {/* Local Recording */}
      <Tooltip title={isRecording ? 'Stop Recording' : 'Record Locally (.webm)'}>
        <IconButton
          onClick={onToggleRecording}
          sx={{
            backgroundColor: isRecording ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none',
            '&:hover': { backgroundColor: isRecording ? '#dc2626' : 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          {isRecording ? <StopCircleIcon /> : <FiberManualRecordIcon />}
        </IconButton>
      </Tooltip>

      {/* Host Security Controls (If Host) */}
      {isHost && (
        <>
          <Tooltip title="Host Security Controls">
            <IconButton
              onClick={(e) => setSecurityAnchor(e.currentTarget)}
              sx={{
                backgroundColor: isRoomLocked ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:hover': { backgroundColor: isRoomLocked ? '#dc2626' : 'rgba(255, 255, 255, 0.2)' },
              }}
            >
              <SecurityIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={securityAnchor}
            open={Boolean(securityAnchor)}
            onClose={() => setSecurityAnchor(null)}
            PaperProps={{ sx: { backgroundColor: '#1e293b', color: '#fff', borderRadius: 2 } }}
          >
            <MenuItem
              onClick={() => {
                onToggleRoomLock(!isRoomLocked);
                setSecurityAnchor(null);
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>
                {isRoomLocked ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>{isRoomLocked ? 'Unlock Room' : 'Lock Room'}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onToggleWaitingRoom(!isWaitingRoomEnabled);
                setSecurityAnchor(null);
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>
                <MeetingRoomIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{isWaitingRoomEnabled ? 'Disable Waiting Room' : 'Enable Waiting Room'}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onMuteAll();
                setSecurityAnchor(null);
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>
                <VolumeOffIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mute All Participants</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}

      {/* Keyboard Shortcuts (?) */}
      <Tooltip title="Keyboard Shortcuts (?)">
        <IconButton
          onClick={onOpenShortcuts}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <KeyboardIcon />
        </IconButton>
      </Tooltip>

      {/* Leave / End Call */}
      <Tooltip title="Leave Meeting">
        <IconButton
          onClick={(e) => {
            if (isHost) {
              setLeaveAnchor(e.currentTarget);
            } else {
              onLeaveMeeting();
            }
          }}
          sx={{
            backgroundColor: '#ef4444',
            color: '#fff',
            ml: 1,
            '&:hover': { backgroundColor: '#dc2626' },
          }}
        >
          <CallEndIcon />
        </IconButton>
      </Tooltip>

      {/* Host Leave Options Menu */}
      <Menu
        anchorEl={leaveAnchor}
        open={Boolean(leaveAnchor)}
        onClose={() => setLeaveAnchor(null)}
        PaperProps={{ sx: { backgroundColor: '#1e293b', color: '#fff', borderRadius: 2 } }}
      >
        <MenuItem
          onClick={() => {
            setLeaveAnchor(null);
            onLeaveMeeting();
          }}
        >
          Just Leave Meeting
        </MenuItem>
        <MenuItem
          onClick={() => {
            setLeaveAnchor(null);
            onEndMeetingForAll();
          }}
          sx={{ color: '#ef4444' }}
        >
          End Meeting for All
        </MenuItem>
      </Menu>
    </Box>
  );
};

