import React from 'react';
import { Box } from '@mui/material';

export const AudioMeter = ({ level = 0, width = 120, height = 6 }) => {
  const percentage = Math.min(Math.max(level * 220, 0), 100);

  return (
    <Box
      sx={{
        width,
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${percentage}%`,
          transition: 'width 80ms ease-out',
          background:
            percentage > 75
              ? 'linear-gradient(90deg, #10b981 60%, #ef4444 100%)'
              : percentage > 45
              ? 'linear-gradient(90deg, #10b981 70%, #f59e0b 100%)'
              : '#10b981',
          borderRadius: height / 2,
        }}
      />
    </Box>
  );
};

