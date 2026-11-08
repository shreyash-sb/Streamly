import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
            Terms of Service
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
            By using Streamly, you agree to these Terms of Service. Streamly is provided free of charge as an open-source,
            privacy-focused communication utility.
          </Typography>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#fff' }}>
            Acceptable Use
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
            You agree not to use the service for unlawful activities, harassment, unauthorized distribution of copyrighted
            content, or interference with the signaling infrastructure. Hosts maintain discretion to admit, deny, mute,
            or remove participants from their meetings.
          </Typography>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#fff' }}>
            Disclaimer of Warranty
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
            Streamly is provided "as is", without warranty of any kind, express or implied. In no event shall the authors
            or copyright holders be liable for any claim, damages, or connection drops.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

