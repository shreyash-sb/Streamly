import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f3f4f6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" fontWeight="800" sx={{ fontSize: '5rem', color: 'primary.light', mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mb: 4 }}>
        The meeting code or page URL you navigated to does not exist or has expired.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ borderRadius: 2.5, px: 3, py: 1.2 }}>
        Return to Streamly
      </Button>
    </Box>
  );
}

