import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';

export const NotesPanel = ({ initialNotes = '', onUpdateNotes, externalNotes, roomCode, onClose }) => {
  const [notes, setNotes] = useState(initialNotes);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (externalNotes !== undefined && externalNotes !== null) {
      setNotes(externalNotes);
    }
  }, [externalNotes]);

  const handleChange = (e) => {
    const val = e.target.value;
    setNotes(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (onUpdateNotes) {
        onUpdateNotes(val);
      }
    }, 400);
  };

  const handleDownload = () => {
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Streamly-Notes-${roomCode || 'meeting'}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);
  };

  return (
    <Paper
      elevation={6}
      sx={{
        width: { xs: '100%', sm: 360 },
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
          <DescriptionIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight="bold">
            Shared Notes (.md)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Download Markdown (.md)">
            <IconButton size="small" onClick={handleDownload} sx={{ color: 'text.secondary' }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Text Area */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <TextField
          multiline
          fullWidth
          value={notes}
          onChange={handleChange}
          placeholder="# Meeting Notes&#10;&#10;- Action items&#10;- Key discussions&#10;- Next steps..."
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              height: '100%',
              alignItems: 'flex-start',
            },
          }}
          sx={{ height: '100%', '& .MuiInputBase-root': { height: '100%' } }}
        />
      </Box>

      <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'right' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Auto-synchronized across participants
        </Typography>
      </Box>
    </Paper>
  );
};

