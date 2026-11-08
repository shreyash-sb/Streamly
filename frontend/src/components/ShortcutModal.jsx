import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';

export const ShortcutModal = ({ open, onClose }) => {
  const shortcuts = [
    { key: 'M', action: 'Mute / Unmute microphone' },
    { key: 'V', action: 'Start / Stop camera' },
    { key: 'S', action: 'Start / Stop screen share' },
    { key: 'C', action: 'Open / Close in-meeting chat' },
    { key: 'H', action: 'Raise / Lower hand' },
    { key: 'P', action: 'Open / Close participants panel' },
    { key: '?', action: 'Show this keyboard shortcuts guide' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Keyboard Shortcuts
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Table size="small">
          <TableBody>
            {shortcuts.map((item) => (
              <TableRow key={item.key}>
                <TableCell sx={{ pl: 0, py: 1.2 }}>
                  <Chip
                    label={item.key}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      minWidth: 32,
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: 'primary.main',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1.2, color: 'text.secondary', fontSize: '0.875rem' }}>
                  {item.action}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

