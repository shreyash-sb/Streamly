import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [defaultLanguage, setDefaultLanguage] = useState(user?.preferences?.defaultLanguage || 'en-US');
  const [defaultMuted, setDefaultMuted] = useState(!!user?.preferences?.defaultMuted);
  const [defaultVideoOff, setDefaultVideoOff] = useState(!!user?.preferences?.defaultVideoOff);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const languages = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
    { code: 'hi-IN', label: 'Hindi' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      await updateProfile({
        name,
        preferences: {
          defaultLanguage,
          defaultMuted,
          defaultVideoOff,
        },
      });
      setStatusMessage({ type: 'success', text: 'Profile preferences updated successfully.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      await logout();
      navigate('/auth');
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    }
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', p: { xs: 2.5, md: 6 } }}>
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/home')}
          sx={{ mb: 3, color: 'primary.light' }}
        >
          Back to Dashboard
        </Button>

        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            backgroundColor: '#111827',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
            <Avatar
              sx={{
                width: 68,
                height: 68,
                bgcolor: 'primary.main',
                fontSize: '1.75rem',
                fontWeight: 700,
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {name || 'User Profile'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                @{user?.username || 'guest'} • Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </Typography>
            </Box>
          </Box>

          {statusMessage.text && (
            <Alert severity={statusMessage.type} sx={{ mb: 3 }} onClose={() => setStatusMessage({ type: '', text: '' })}>
              {statusMessage.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Display Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputLabelProps={{ sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2 } }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'text.secondary' }}>Default Captions Language</InputLabel>
              <Select
                value={defaultLanguage}
                label="Default Captions Language"
                onChange={(e) => setDefaultLanguage(e.target.value)}
                sx={{ color: '#fff', borderRadius: 2 }}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              <Typography variant="subtitle2" sx={{ color: 'primary.light', fontWeight: 700, mb: 1 }}>
                Default Meeting Entry Preferences
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={defaultMuted}
                    onChange={(e) => setDefaultMuted(e.target.checked)}
                    color="primary"
                  />
                }
                label="Always enter meetings with microphone muted"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={defaultVideoOff}
                    onChange={(e) => setDefaultVideoOff(e.target.checked)}
                    color="primary"
                  />
                }
                label="Always enter meetings with camera turned off"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ px: 3, py: 1.2, borderRadius: 2.5, fontWeight: 700 }}
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={() => setShowDeleteConfirm(true)}
                sx={{ borderRadius: 2.5 }}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        PaperProps={{ sx: { backgroundColor: '#111827', color: '#fff', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#ef4444' }}>
          Delete Account (GDPR Compliance)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to permanently delete your account and all associated meeting history? This action is irreversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowDeleteConfirm(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteAccount} sx={{ borderRadius: 2 }}>
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

