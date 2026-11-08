import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import api from '../services/api';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/meetings/user');
      setMeetings(data || []);
    } catch (err) {
      console.warn('Could not fetch meeting history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (meeting) => {
    setSelectedMeeting(meeting);
    setActiveTab(0);
    try {
      const { data } = await api.get(`/meetings/${meeting.meetingCode}/detail`);
      if (data) {
        setSelectedMeeting(data);
      }
    } catch (e) {}
  };

  const handleGenerateSummary = async () => {
    if (!selectedMeeting) return;
    setIsSummarizing(true);
    try {
      const { data } = await api.post('/ai/summarize', {
        code: selectedMeeting.meetingCode,
        transcript: selectedMeeting.transcript || [],
      });
      setSelectedMeeting((prev) => ({
        ...prev,
        summary: data.summary,
      }));
    } catch (err) {
      alert('Could not generate meeting summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!selectedMeeting) return;
    const m = selectedMeeting;
    const mdLines = [
      `# Streamly Meeting Record: ${m.title || m.meetingCode}`,
      `**Code:** ${m.meetingCode}`,
      `**Date:** ${new Date(m.date || m.createdAt).toLocaleString()}`,
      `**Duration:** ${Math.round((m.durationSeconds || 0) / 60)} minutes`,
      '',
      '## AI Meeting Summary',
      m.summary?.overview || 'No summary generated yet.',
      '',
      '### Key Decisions',
      ...(m.summary?.keyDecisions?.map((d) => `- ${d}`) || ['None recorded.']),
      '',
      '### Action Items',
      ...(m.summary?.actionItems?.map((a) => `- [ ] ${a.task} (@${a.owner || 'Unassigned'})`) || ['None recorded.']),
      '',
      '## Shared Notes',
      m.notes || 'No shared notes recorded.',
      '',
      '## Meeting Transcript',
      ...(m.transcript?.map((t) => `**[${t.speaker}]**: ${t.text}`) || ['No transcript recorded.']),
      '',
      '## Chat Messages',
      ...(m.chat?.map((c) => `**${c.senderName || c.sender}**: ${c.message}`) || ['No chat messages recorded.']),
    ];

    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Streamly-Summary-${m.meetingCode}.md`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);
  };

  const handleDeleteMeeting = async (code) => {
    if (!window.confirm('Are you sure you want to delete this meeting record?')) return;
    try {
      await api.delete(`/meetings/${code}`);
      setMeetings((prev) => prev.filter((m) => m.meetingCode !== code));
      if (selectedMeeting?.meetingCode === code) setSelectedMeeting(null);
    } catch (e) {
      alert('Failed to delete meeting.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6' }}>
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.5, md: 6 },
          py: 2.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#111827',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/home')} sx={{ color: '#fff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            Meeting History & Transcripts
          </Typography>
        </Box>
      </Box>

      {/* Main Container */}
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2.5, md: 6 } }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'primary.light' }} />
          </Box>
        ) : meetings.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: '#111827',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No past meetings recorded
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              When you complete meetings on Streamly, their transcripts, notes, and chat logs appear here.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/home')} sx={{ borderRadius: 2 }}>
              Back to Dashboard
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {meetings.map((m) => (
              <Card
                key={m.meetingCode}
                sx={{
                  backgroundColor: '#111827',
                  borderRadius: 3.5,
                  p: 2,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff' }}>
                      {m.title || 'Instant Meeting'}
                    </Typography>
                    <Chip
                      label={m.meetingCode}
                      size="small"
                      sx={{ fontFamily: 'monospace', height: 22, backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'primary.light' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
                    📅 {new Date(m.date || m.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
                    ⏱️ {Math.round((m.durationSeconds || 0) / 60)} min
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    👥 {m.participants?.length || 1} participant(s)
                  </Typography>
                </CardContent>

                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AutoAwesomeIcon sx={{ color: 'primary.light' }} />}
                    onClick={() => handleOpenDetail(m)}
                    sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: 2 }}
                  >
                    View Details & AI Summary
                  </Button>

                  <IconButton
                    size="small"
                    onClick={() => handleDeleteMeeting(m.meetingCode)}
                    sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Meeting Detail & AI Summary Modal */}
      {selectedMeeting && (
        <Dialog
          open={Boolean(selectedMeeting)}
          onClose={() => setSelectedMeeting(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { backgroundColor: '#111827', color: '#fff', borderRadius: 4 } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedMeeting.title || 'Meeting Details'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Code: {selectedMeeting.meetingCode} • {new Date(selectedMeeting.date || selectedMeeting.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExportMarkdown}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
              >
                Export .MD
              </Button>
            </Box>
          </DialogTitle>

          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{ px: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <Tab icon={<AutoAwesomeIcon fontSize="small" />} iconPosition="start" label="AI Summary" sx={{ color: '#9ca3af' }} />
            <Tab icon={<ClosedCaptionIcon fontSize="small" />} iconPosition="start" label="Transcript" sx={{ color: '#9ca3af' }} />
            <Tab icon={<DescriptionIcon fontSize="small" />} iconPosition="start" label="Shared Notes" sx={{ color: '#9ca3af' }} />
            <Tab icon={<ChatBubbleOutlineIcon fontSize="small" />} iconPosition="start" label="Chat Log" sx={{ color: '#9ca3af' }} />
          </Tabs>

          <DialogContent sx={{ minHeight: 320, p: 3 }}>
            {/* Tab 0: AI Summary */}
            {activeTab === 0 && (
              <Box>
                {selectedMeeting.summary?.overview ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'primary.light', fontWeight: 700, mb: 1 }}>
                        Overview
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#e2e8f0' }}>
                        {selectedMeeting.summary.overview}
                      </Typography>
                    </Box>

                    {selectedMeeting.summary.keyDecisions?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 700, mb: 1 }}>
                          Key Decisions
                        </Typography>
                        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                          {selectedMeeting.summary.keyDecisions.map((dec, i) => (
                            <li key={i} style={{ color: '#cbd5e1', marginBottom: 4 }}>
                              {dec}
                            </li>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {selectedMeeting.summary.actionItems?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                          Action Items & Owners
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {selectedMeeting.summary.actionItems.map((item, i) => (
                            <Box
                              key={i}
                              sx={{
                                p: 1.2,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="body2" sx={{ color: '#fff' }}>
                                • {item.task}
                              </Typography>
                              <Chip
                                label={item.owner || 'Assigned'}
                                size="small"
                                sx={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 44, color: 'primary.light', mb: 1.5 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      No summary generated for this meeting yet.
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                      Streamly automatically analyzes the transcript to extract key decisions and action items.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleGenerateSummary}
                      disabled={isSummarizing || !selectedMeeting.transcript || selectedMeeting.transcript.length === 0}
                      sx={{ borderRadius: 2 }}
                    >
                      {isSummarizing ? 'Generating AI Summary...' : 'Generate Summary Now'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 1: Transcript */}
            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedMeeting.transcript?.length > 0 ? (
                  selectedMeeting.transcript.map((item, idx) => (
                    <Box key={idx} sx={{ p: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 0.3 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.light' }}>
                          {item.speaker || 'Participant'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    No captions or transcript recorded for this call.
                  </Typography>
                )}
              </Box>
            )}

            {/* Tab 2: Shared Notes */}
            {activeTab === 2 && (
              <Box>
                {selectedMeeting.notes ? (
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 2 }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: '#e2e8f0' }}>
                      {selectedMeeting.notes}
                    </pre>
                  </Paper>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    No shared notes taken during this meeting.
                  </Typography>
                )}
              </Box>
            )}

            {/* Tab 3: Chat Log */}
            {activeTab === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedMeeting.chat?.length > 0 ? (
                  selectedMeeting.chat.map((c, idx) => (
                    <Box key={idx} sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#818cf8' }}>
                          {c.senderName || c.sender}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : ''}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{c.message}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    No chat messages recorded during this meeting.
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedMeeting(null)} sx={{ color: 'text.secondary' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
