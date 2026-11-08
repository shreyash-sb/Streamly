import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  TextField,
  LinearProgress,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PollIcon from '@mui/icons-material/Poll';
import AddIcon from '@mui/icons-material/Add';

export const PollsPanel = ({
  polls = [],
  currentSocketId,
  isHost = false,
  onCreatePoll,
  onVotePoll,
  onClose,
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmitPoll = (e) => {
    e.preventDefault();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) return;

    onCreatePoll({
      question: question.trim(),
      options: validOptions,
    });

    setQuestion('');
    setOptions(['', '']);
    setShowCreate(false);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PollIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight="bold">
            Live Polls
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {showCreate ? (
          <Box component="form" onSubmit={handleSubmitPoll} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: 'primary.light', fontWeight: 700 }}>
              Create New Poll
            </Typography>

            <TextField
              size="small"
              fullWidth
              label="Poll Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              InputLabelProps={{ sx: { color: 'text.secondary' } }}
              InputProps={{ sx: { color: '#fff', borderRadius: 2 } }}
            />

            {options.map((opt, idx) => (
              <TextField
                key={idx}
                size="small"
                fullWidth
                label={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                required
                InputLabelProps={{ sx: { color: 'text.secondary' } }}
                InputProps={{ sx: { color: '#fff', borderRadius: 2 } }}
              />
            ))}

            {options.length < 5 && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddOption}
                sx={{ alignSelf: 'flex-start', color: 'primary.light' }}
              >
                Add Option
              </Button>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button type="submit" variant="contained" fullWidth sx={{ borderRadius: 2 }}>
                Launch Poll
              </Button>
              <Button variant="outlined" onClick={() => setShowCreate(false)} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {isHost && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowCreate(true)}
                sx={{ borderRadius: 2, borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Create a Poll
              </Button>
            )}

            {polls.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: 'text.secondary', my: 'auto' }}>
                <Typography variant="body2">No active polls.</Typography>
                <Typography variant="caption">The host can create quick polls anytime.</Typography>
              </Box>
            ) : (
              polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                const userVotedOptionIndex = poll.options.findIndex((opt) => opt.votes?.includes(currentSocketId));

                return (
                  <Paper
                    key={poll.id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#fff', mb: 1.5 }}>
                      {poll.question}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      {poll.options.map((opt, idx) => {
                        const count = opt.votes?.length || 0;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const hasVotedThis = userVotedOptionIndex === idx;

                        return (
                          <Box
                            key={idx}
                            onClick={() => onVotePoll(poll.id, idx)}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: hasVotedThis ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                              backgroundColor: hasVotedThis ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#fff' }}>
                                {opt.text} {hasVotedThis && '✓'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {count} ({pct}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  backgroundColor: hasVotedThis ? 'primary.main' : 'secondary.main',
                                },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>

                    <Box sx={{ mt: 1.5, textAlign: 'right' }}>
                      <Chip label={`${totalVotes} total votes`} size="small" sx={{ fontSize: '0.7rem' }} />
                    </Box>
                  </Paper>
                );
              })
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

