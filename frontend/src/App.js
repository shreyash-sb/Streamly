import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

import { getAppTheme } from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import HomeComponent from './pages/home';
import HistoryPage from './pages/history';
import Profile from './pages/Profile';
import VideoMeetComponent from './pages/VideoMeet';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

function App() {
  const theme = getAppTheme('dark');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/room/:url" element={<VideoMeetComponent />} />
            <Route path="/:url" element={<VideoMeetComponent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
