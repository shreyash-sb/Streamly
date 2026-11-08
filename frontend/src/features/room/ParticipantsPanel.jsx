import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  Avatar,
  Chip,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import StarIcon from '@mui/icons-material/Star';
import BackHandIcon from '@mui/icons-material/BackHand';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export const ParticipantsPanel = ({
  participants = [],
  waitingList = [],
  currentSocketId,
  isHost = false,
  onMuteParticipant,
  onRemoveParticipant,
  onTransferHost,
  onMuteAll,
  onAdmitUser,
  onDenyUser,
  onAdmitAll,
  onClose,
}) => {
  return (
    <Paper
      elevation={6}
      sx={{
        width: { xs: '100%', sm: 340 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#111827',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight="bold">
            Participants ({participants.length})
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Host Mute All Bar */}
      {isHost && participants.length > 1 && (
        <Box sx={{ p: 1.5, px: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={onMuteAll}
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#ef4444',
              '&:hover': { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
            }}
          >
            Mute All Participants
          </Button>
        </Box>
      )}

      {/* Main List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Waiting Room Section for Host */}
        {isHost && waitingList.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                Waiting Room ({waitingList.length})
              </Typography>
              <Button size="small" variant="text" onClick={onAdmitAll} sx={{ color: '#f59e0b', py: 0 }}>
                Admit All
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {waitingList.map((user) => (
                <Box
                  key={user.socketId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 0.8,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Admit">
                      <IconButton
                        size="small"
                        onClick={() => onAdmitUser(user.socketId)}
                        sx={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deny">
                      <IconButton
                        size="small"
                        onClick={() => onDenyUser(user.socketId)}
                        sx={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* In-Call Participants List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {participants.map((p) => {
            const isMe = p.socketId === currentSocketId;
            return (
              <Box
                key={p.socketId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.2,
                  borderRadius: 2,
                  backgroundColor: isMe ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: isMe ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.85rem',
                      bgcolor: isMe ? 'primary.main' : 'secondary.main',
                    }}
                  >
                    {p.name ? p.name[0].toUpperCase() : 'P'}
                  </Avatar>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {p.name} {isMe ? '(You)' : ''}
                      </Typography>
                      {p.isHost && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                          label="Host"
                          size="small"
                          sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#6366f1', color: '#fff' }}
                        />
                      )}
                    </Box>

                    {p.handRaised && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#f59e0b', mt: 0.2 }}>
                        <BackHandIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Hand raised
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Status and Host Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {p.isAudioMuted ? (
                    <MicOffIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                  ) : (
                    <MicIcon sx={{ fontSize: 18, color: '#10b981' }} />
                  )}

                  {isHost && !isMe && (
                    <>
                      <Tooltip title="Mute Participant">
                        <IconButton
                          size="small"
                          onClick={() => onMuteParticipant(p.socketId)}
                          sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                        >
                          <MicOffIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Make Host">
                        <IconButton
                          size="small"
                          onClick={() => onTransferHost(p.socketId)}
                          sx={{ color: 'text.secondary', '&:hover': { color: '#6366f1' } }}
                        >
                          <StarIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remove Participant">
                        <IconButton
                          size="small"
                          onClick={() => onRemoveParticipant(p.socketId)}
                          sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

