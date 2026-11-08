import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1', // Vibrant Indigo
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#a855f7', // Electric Violet
        light: '#c084fc',
        dark: '#9333ea',
      },
      background: {
        default: isDark ? '#090d16' : '#f8fafc',
        paper: isDark ? '#0f172a' : '#ffffff',
        elevated: isDark ? '#1e293b' : '#f1f5f9',
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      success: {
        main: '#10b981', // Emerald
        light: '#34d399',
      },
      warning: {
        main: '#f59e0b', // Amber
      },
      error: {
        main: '#ef4444', // Rose/Red
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '9px 20px',
            boxShadow: 'none',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.45)',
              transform: 'translateY(-1px)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: isDark
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
  });
};
