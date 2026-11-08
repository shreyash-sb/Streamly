import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', p: { xs: 3, md: 8 } }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 4, color: 'primary.light' }}
        >
          Back to Home
        </Button>

        <Paper sx={{ p: { xs: 3, md: 6 }, backgroundColor: '#111827', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
            Streamly Privacy Policy
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
            Streamly was built on the core principle of zero surveillance and user privacy. Unlike traditional
            conferencing software that routes and stores video streams on centralized cloud recording clusters,
            Streamly operates over peer-to-peer (P2P) WebRTC mesh connections.
          </Typography>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#fff' }}>
            1. P2P Media Streams
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
            Audio and video feeds travel directly between participant browsers using DTLS-SRTP encryption.
            The signaling server facilitates session discovery (offer/answer/ICE exchange) and never relays or stores raw media.
          </Typography>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#fff' }}>
            2. Local Recording Only
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
            Meeting recordings are captured strictly within the user's local browser via the HTML5 MediaRecorder API
            and downloaded immediately to disk as .webm. No media chunks are ever uploaded to any server.
          </Typography>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#fff' }}>
            3. Account & Data Deletion
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
            Guests can join without accounts. Registered users can delete their account and associated meeting records
            at any time in compliance with GDPR standards.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

