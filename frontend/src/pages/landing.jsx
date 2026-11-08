import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import BrushIcon from '@mui/icons-material/Brush';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [meetingCode, setMeetingCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleStartInstantMeeting = async () => {
    setIsCreating(true);
    try {
      const { data } = await api.post('/meetings/create', { title: 'Instant Meeting' });
      navigate(`/${data.meetingCode}`);
    } catch (err) {
      const code = 'room-' + Math.random().toString(36).substring(2, 9);
      navigate(`/${code}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinWithCode = (e) => {
    e.preventDefault();
    if (!meetingCode.trim()) return;
    navigate(`/${meetingCode.trim()}`);
  };

  const comparisonRows = [
    { feature: 'No app download or install required', streamly: true, zoom: false, teams: false, meet: true },
    { feature: 'Instant guest join without creating an account', streamly: true, zoom: false, teams: false, meet: false },
    { feature: 'Adaptive low-bandwidth mode (360p / 15fps auto-switch)', streamly: true, zoom: false, teams: false, meet: false },
    { feature: 'Free live speech captions & transcript collection', streamly: true, zoom: false, teams: false, meet: true },
    { feature: 'Direct P2P encrypted media (zero server media storage)', streamly: true, zoom: false, teams: false, meet: false },
    { feature: 'Integrated real-time whiteboard & synced notes (.md)', streamly: true, zoom: false, teams: true, meet: false },
    { feature: 'Local-only recording (.webm saved to device)', streamly: true, zoom: false, teams: false, meet: false },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient background glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(0,0,0,0) 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.5, md: 8 },
          py: 2.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(9, 13, 22, 0.75)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)',
            }}
          >
            <VideocamIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Streamly
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              onClick={() => navigate('/home')}
              sx={{ borderRadius: 3, px: 2.8 }}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="text"
                onClick={() => navigate('/auth')}
                sx={{ color: '#cbd5e1', '&:hover': { color: '#fff' } }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/auth')}
                sx={{
                  borderRadius: 3,
                  px: 2.8,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                Get Started Free
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 14 },
          pb: { xs: 8, md: 12 },
          px: { xs: 3, md: 8 },
          textAlign: 'center',
          maxWidth: 1060,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Chip
          label="✨ Zero-Friction WebRTC Video Meetings • No Downloads"
          size="small"
          sx={{
            mb: 3.5,
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'primary.light',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            fontWeight: 700,
            py: 2,
            px: 1.5,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.6rem', sm: '3.8rem', md: '4.8rem' },
            fontWeight: 800,
            lineHeight: 1.1,
            mb: 3,
            letterSpacing: '-0.035em',
          }}
        >
          Meet in one click.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Works on bad internet.
          </span>
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            maxWidth: 720,
            fontWeight: 400,
            lineHeight: 1.65,
            mb: 5,
            fontSize: { xs: '1.05rem', md: '1.25rem' },
          }}
        >
          Zero friction, privacy-respecting video conferencing. No forced accounts, no software installs,
          and automatic low-bandwidth adaptation with live AI transcriptions.
        </Typography>

        {/* CTA Area */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: '100%',
            maxWidth: 600,
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            disabled={isCreating}
            onClick={handleStartInstantMeeting}
            sx={{
              py: 1.8,
              px: 3.8,
              fontSize: '1.05rem',
              fontWeight: 700,
              borderRadius: 3,
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {isCreating ? 'Creating...' : 'Start an Instant Meeting'}
          </Button>

          <Box
            component="form"
            onSubmit={handleJoinWithCode}
            sx={{
              display: 'flex',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              flex: 1,
            }}
          >
            <TextField
              size="small"
              placeholder="Enter meeting code..."
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 3,
                  fontSize: '0.95rem',
                },
              }}
            />
            <Button
              type="submit"
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                whiteSpace: 'nowrap',
                px: 2.8,
              }}
            >
              Join
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'text.secondary', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} /> 100% Free P2P Mesh
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} /> End-to-End Encrypted Media
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} /> No Account Needed
          </Typography>
        </Box>
      </Box>

      {/* Feature Cards Grid */}
      <Box sx={{ py: 10, px: { xs: 3, md: 8 }, maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 800, letterSpacing: '0.12em' }}>
            ENGINEERED FOR WEAK NETWORKS & BUSY TEAMS
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
            Everything you need for seamless collaboration
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3.5,
          }}
        >
          {[
            {
              icon: <SignalCellularAltIcon sx={{ color: '#10b981', fontSize: 32 }} />,
              title: 'Adaptive Low-Bandwidth Mode',
              desc: 'Continuous getStats() monitoring throttles video down to 360p / 15fps when packet loss rises, guaranteeing your call never drops on spotty Wi-Fi.',
            },
            {
              icon: <SecurityIcon sx={{ color: '#6366f1', fontSize: 32 }} />,
              title: 'Waiting Room & Anti-Bombing',
              desc: 'Host security controls with waiting room queues (Admit, Admit All, Deny), room locks, force muting, and server-verified permissions.',
            },
            {
              icon: <ClosedCaptionIcon sx={{ color: '#a855f7', fontSize: 32 }} />,
              title: 'Live Captions & AI Summaries',
              desc: 'In-browser live speech recognition broadcast in real-time, automatically extracting meeting overviews, key decisions, and assigned action items.',
            },
            {
              icon: <BrushIcon sx={{ color: '#f59e0b', fontSize: 32 }} />,
              title: 'Synced Whiteboard & Notes',
              desc: 'Collaborate live on an interactive synced canvas with pen tools and export your notes directly as a Markdown document.',
            },
            {
              icon: <BoltIcon sx={{ color: '#06b6d4', fontSize: 32 }} />,
              title: 'Sub-Second WebRTC Calling',
              desc: 'Direct DTLS-SRTP encrypted peer-to-peer media delivery with W3C Perfect Negotiation to prevent offer/answer glare.',
            },
            {
              icon: <CheckCircleIcon sx={{ color: '#ec4899', fontSize: 32 }} />,
              title: 'Instant Guest Access',
              desc: 'Anyone can join your meeting in seconds with just a display name. No app downloads, browser extensions, or credit cards required.',
            },
          ].map((item, i) => (
            <Paper
              key={i}
              sx={{
                p: 4,
                borderRadius: 4,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 250ms ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 30px -10px rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                {item.icon}
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.2, color: '#fff' }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
                {item.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Comparison Table */}
      <Box sx={{ py: 10, px: { xs: 2.5, md: 8 }, maxWidth: 1050, mx: 'auto', position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 800, letterSpacing: '0.12em' }}>
            WHY STREAMLY
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
            Streamly vs. Legacy Platforms
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflowX: 'auto',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, py: 2 }}>Platform Feature</TableCell>
                <TableCell align="center" sx={{ color: 'primary.light', fontWeight: 800, fontSize: '1.05rem', py: 2 }}>
                  Streamly
                </TableCell>
                <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, py: 2 }}>
                  Zoom
                </TableCell>
                <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, py: 2 }}>
                  Teams
                </TableCell>
                <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, py: 2 }}>
                  Google Meet
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonRows.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                  }}
                >
                  <TableCell sx={{ color: '#fff', fontWeight: 500, py: 2 }}>{row.feature}</TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    {row.zoom ? (
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    ) : (
                      <CancelIcon sx={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: 20 }} />
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    {row.teams ? (
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    ) : (
                      <CancelIcon sx={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: 20 }} />
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    {row.meet ? (
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    ) : (
                      <CancelIcon sx={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: 20 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          px: { xs: 3, md: 8 },
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © {new Date().getFullYear()} Streamly. Open-source, production-grade video conferencing.
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>
            Privacy Policy
          </Link>
          <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>
            Terms of Service
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
