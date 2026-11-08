import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoodIcon from '@mui/icons-material/Mood';
import LockIcon from '@mui/icons-material/Lock';
import DownloadIcon from '@mui/icons-material/Download';

export const ChatPanel = ({
  messages = [],
  participants = [],
  currentSocketId,
  myDisplayName,
  onSendMessage,
  onTyping,
  typingUsers = [],
  onClose,
}) => {
  const [text, setText] = useState('');
  const [targetRecipient, setTargetRecipient] = useState('everyone');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const quickEmojis = ['😀', '👍', '❤️', '🎉', '🔥', '👏', '🚀', '🙌'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    const isPrivate = targetRecipient !== 'everyone';
    onSendMessage({
      message: text.trim(),
      isPrivate,
      toSocketId: isPrivate ? targetRecipient : null,
    });

    setText('');
    if (onTyping) onTyping(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const isPrivate = targetRecipient !== 'everyone';
      onSendMessage({
        message: `Shared file: ${file.name} (${Math.round(file.size / 1024)} KB)`,
        isPrivate,
        toSocketId: isPrivate ? targetRecipient : null,
        fileData: {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result,
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const renderMessageContent = (msg) => {
    // URL detection regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = msg.message.split(urlRegex);

    return (
      <Box>
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {parts.map((part, i) =>
            urlRegex.test(part) ? (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#818cf8', textDecoration: 'underline' }}
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
        </Typography>

        {msg.fileData && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            {msg.fileData.type?.startsWith('image/') ? (
              <img
                src={msg.fileData.dataUrl}
                alt={msg.fileData.name}
                style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 6, objectFit: 'contain' }}
              />
            ) : (
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                📁 {msg.fileData.name}
              </Typography>
            )}

            <IconButton
              size="small"
              href={msg.fileData.dataUrl}
              download={msg.fileData.name}
              sx={{ color: '#fff' }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  };

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
        <Typography variant="subtitle1" fontWeight="bold">
          In-Call Chat
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Recipient Selector (Everyone or Direct Message) */}
      <Box sx={{ px: 2, pt: 1.5 }}>
        <FormControl size="small" fullWidth>
          <InputLabel sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Send to</InputLabel>
          <Select
            value={targetRecipient}
            label="Send to"
            onChange={(e) => setTargetRecipient(e.target.value)}
            sx={{ color: '#fff', fontSize: '0.875rem' }}
          >
            <MenuItem value="everyone">Everyone</MenuItem>
            {participants
              .filter((p) => p.socketId !== currentSocketId)
              .map((p) => (
                <MenuItem key={p.socketId} value={p.socketId}>
                  🔒 {p.name} (Direct Message)
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Message List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', my: 'auto' }}>
            <Typography variant="body2">No messages yet.</Typography>
            <Typography variant="caption">Say hello to the room!</Typography>
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderSocketId === currentSocketId;
            return (
              <Box
                key={msg.id || index}
                sx={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: isMe
                    ? 'rgba(99, 102, 241, 0.25)'
                    : msg.isPrivate
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: isMe
                    ? '1px solid rgba(99, 102, 241, 0.4)'
                    : msg.isPrivate
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 2.5,
                  p: 1.2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: isMe ? '#818cf8' : '#cbd5e1' }}>
                    {isMe ? 'You' : msg.senderName}
                  </Typography>

                  {msg.isPrivate && (
                    <Chip
                      icon={<LockIcon sx={{ fontSize: '10px !important' }} />}
                      label="Direct"
                      size="small"
                      sx={{ height: 16, fontSize: '0.65rem', backgroundColor: '#f59e0b', color: '#000' }}
                    />
                  )}

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', ml: 'auto' }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Typography>
                </Box>

                {renderMessageContent(msg)}
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <Box sx={{ px: 2, py: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Typography>
        </Box>
      )}

      {/* Quick Emojis Tray */}
      {showEmojiPicker && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.8,
            px: 1.5,
            py: 0.8,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            overflowX: 'auto',
          }}
        >
          {quickEmojis.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => setText((prev) => prev + emoji)}
              sx={{ fontSize: '1.1rem', p: 0.5 }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      )}

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        <Tooltip title="Share File / Image (Max 10MB)">
          <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ color: 'text.secondary' }}>
            <AttachFileIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Quick Emojis">
          <IconButton
            size="small"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            sx={{ color: showEmojiPicker ? 'primary.light' : 'text.secondary' }}
          >
            <MoodIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <TextField
          size="small"
          fullWidth
          placeholder={targetRecipient === 'everyone' ? 'Message everyone...' : 'Direct message...'}
          value={text}
          onChange={handleInputChange}
          InputProps={{
            sx: {
              color: '#fff',
              fontSize: '0.875rem',
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        />

        <IconButton
          type="submit"
          size="small"
          disabled={!text.trim()}
          sx={{
            color: '#fff',
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' },
            '&.Mui-disabled': { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.3)' },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

