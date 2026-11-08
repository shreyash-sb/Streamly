import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { downloadIcsFile } from '../utils/icsExporter';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [meetingCode, setMeetingCode] = useState('');
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(null);

  // Form for schedule
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await api.get('/meetings/user');
        setRecentMeetings(data || []);
      } catch (err) {
        console.warn('Could not load user meetings:', err);
      }
    };
    fetchRecent();
  }, []);

  const handleStartInstant = async () => {
    try {
      const { data } = await api.post('/meetings/create', { title: 'Instant Meeting' });
      navigate(`/${data.meetingCode}`);
    } catch (e) {
      const code = 'room-' + Math.random().toString(36).substring(2, 9);
      navigate(`/${code}`);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!meetingCode.trim()) return;
    navigate(`/${meetingCode.trim()}`);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/meetings/create', {
        title: title || 'Scheduled Meeting',
        description,
        scheduledFor: scheduledDate ? new Date(scheduledDate).toISOString() : null,
      });

      setScheduledSuccess(data.meeting);
      setShowScheduleModal(false);
      setTitle('');
      setDescription('');
      setScheduledDate('');
    } catch (err) {
      alert('Could not schedule meeting.');
    }
  };

  const handleCopyLink = (code) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    alert('Meeting link copied to clipboard!');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', position: 'relative' }}>
      {/* Ambient background light */}
      <Box
        sx={{
          position: 'absolute',
          top: '-100px',
          left: '20%',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Navbar */}
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.5, md: 6 },
          py: 2.2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <VideocamIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Streamly
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<HistoryIcon />}
            variant="text"
            onClick={() => navigate('/history')}
            sx={{ color: '#cbd5e1', '&:hover': { color: '#fff' } }}
          >
            History
          </Button>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer',
              px: 1.2,
              py: 0.6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 150ms ease',
              '&:hover': { borderColor: 'primary.main' },
            }}
            onClick={() => navigate('/profile')}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              {user?.name || 'Guest User'}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={async () => {
              await logout();
              navigate('/auth');
            }}
            sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Main Container */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2.5, md: 6 }, position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome back, {user?.name || 'there'}!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Start an instant call, schedule an upcoming discussion, or join a room with a code.
          </Typography>
        </Box>

        {/* Action Cards */}
        <Grid container spacing={3.5} sx={{ mb: 6 }}>
          {/* Card 1: New Instant Meeting */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 30px -10px rgba(99, 102, 241, 0.25)',
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <VideocamIcon fontSize="large" />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  New Meeting
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  Create an instant video call and share the invite link with participants.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleStartInstant}
                sx={{ borderRadius: 2.8, py: 1.4, fontWeight: 700 }}
              >
                Start Instant Meeting
              </Button>
            </Paper>
          </Grid>

          {/* Card 2: Join with Code */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: '#10b981',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 30px -10px rgba(16, 185, 129, 0.25)',
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <ArrowForwardIcon fontSize="large" />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Join with Code
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  Enter a room code or paste an invitation link to enter an active call.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleJoin} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="e.g. abc-defg-hij"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  fullWidth
                  InputProps={{
                    sx: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 },
                  }}
                />
                <Button type="submit" variant="contained" color="success" sx={{ borderRadius: 2, px: 2.5, fontWeight: 700 }}>
                  Join
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Card 3: Schedule Meeting */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: '#a855f7',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 30px -10px rgba(168, 85, 247, 0.25)',
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <CalendarMonthIcon fontSize="large" />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Schedule Meeting
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                  Plan ahead, generate calendar invites (.ics), and share scheduled links.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => setShowScheduleModal(true)}
                sx={{ borderRadius: 2.8, py: 1.4, borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', fontWeight: 600 }}
              >
                Schedule for Later
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Scheduled Confirmation Dialog */}
        {scheduledSuccess && (
          <Paper
            sx={{
              p: 3,
              mb: 5,
              borderRadius: 3.5,
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff' }}>
                🎉 Meeting Scheduled: {scheduledSuccess.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Room Code: <strong style={{ color: '#818cf8' }}>{scheduledSuccess.meetingCode}</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopyLink(scheduledSuccess.meetingCode)}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
              >
                Copy Link
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<EventAvailableIcon />}
                onClick={() =>
                  downloadIcsFile({
                    title: scheduledSuccess.title,
                    meetingCode: scheduledSuccess.meetingCode,
                    scheduledFor: scheduledSuccess.scheduledFor,
                  })
                }
              >
                Download .ICS Calendar
              </Button>
            </Box>
          </Paper>
        )}

        {/* Recent Meetings Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Activity
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/history')}
              sx={{ color: 'primary.light', fontWeight: 600 }}
            >
              View Full History →
            </Button>
          </Box>

          {recentMeetings.length === 0 ? (
            <Paper
              sx={{
                p: 5,
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No recent meetings yet. Start your first meeting above!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {recentMeetings.slice(0, 4).map((m, idx) => (
                <Grid item xs={12} sm={6} key={m.meetingCode || idx}>
                  <Card
                    sx={{
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 3.5,
                      p: 1.5,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'border 150ms ease',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#fff' }}>
                          {m.title || 'Instant Meeting'}
                        </Typography>
                        <Chip
                          label={m.meetingCode}
                          size="small"
                          sx={{ fontFamily: 'monospace', height: 22, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Date: {m.date ? new Date(m.date).toLocaleDateString() : 'Recent'}
                      </Typography>
                    </CardContent>

                    <Box sx={{ px: 2, pb: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/${m.meetingCode}`)}
                        sx={{ fontSize: '0.75rem', py: 0.5, borderRadius: 2 }}
                      >
                        Rejoin
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Schedule Modal */}
      <Dialog
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#111827', color: '#fff', borderRadius: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Schedule a Meeting</DialogTitle>
        <Box component="form" onSubmit={handleScheduleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label="Meeting Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning"
              InputLabelProps={{ sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2.5 } }}
            />

            <TextField
              label="Date & Time"
              type="datetime-local"
              fullWidth
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              InputLabelProps={{ shrink: true, sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2.5 } }}
            />

            <TextField
              label="Description (Optional)"
              multiline
              rows={3}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting agenda or notes..."
              InputLabelProps={{ sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2.5 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setShowScheduleModal(false)} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ px: 3, borderRadius: 2.5 }}>
              Schedule
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
