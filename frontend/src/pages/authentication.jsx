import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Alert,
  Divider,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useAuth } from '../contexts/AuthContext';

export default function Authentication() {
  const navigate = useNavigate();
  const { login, register, setGuestName } = useAuth();

  const [tabIndex, setTabIndex] = useState(0); // 0 = Sign In, 1 = Sign Up
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tabIndex === 0) {
        await login(username, password);
        navigate('/home');
      } else {
        await register(name, username, password, email);
        navigate('/home');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    const guestId = 'Guest-' + Math.floor(1000 + Math.random() * 9000);
    setGuestName(guestId);
    navigate('/home');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090d16',
        color: '#f3f4f6',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 440,
          width: '100%',
          p: { xs: 3, sm: 4.5 },
          borderRadius: 4,
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, justifyContent: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VideocamIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
            Streamly
          </Typography>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(e, val) => {
            setTabIndex(val);
            setErrorMsg('');
          }}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <Tab label="Sign In" sx={{ color: '#9ca3af', fontWeight: 600 }} />
          <Tab label="Sign Up" sx={{ color: '#9ca3af', fontWeight: 600 }} />
        </Tabs>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabIndex === 1 && (
            <TextField
              label="Full Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputLabelProps={{ sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2 } }}
            />
          )}

          <TextField
            label="Username"
            required
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            InputProps={{ sx: { color: '#fff', borderRadius: 2 } }}
          />

          {tabIndex === 1 && (
            <TextField
              label="Email (Optional)"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2 } }}
            />
          )}

          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            InputProps={{ sx: { color: '#fff', borderRadius: 2 } }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.3,
              fontWeight: 700,
              borderRadius: 2.5,
              mt: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            {loading ? 'Please wait...' : tabIndex === 0 ? 'Sign In' : 'Create Account'}
          </Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
            OR
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleContinueAsGuest}
          sx={{
            py: 1.2,
            borderRadius: 2.5,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            fontWeight: 600,
            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.4)' },
          }}
        >
          Continue as Instant Guest
        </Button>
      </Paper>
    </Box>
  );
}
