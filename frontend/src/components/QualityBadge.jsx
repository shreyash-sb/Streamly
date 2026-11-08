import React from 'react';
import { Box, Tooltip } from '@mui/material';

export const QualityBadge = ({ rating = 3, rtt = 0, packetLoss = 0 }) => {
  const getColor = (barIndex) => {
    if (rating >= barIndex) {
      if (rating === 3) return '#10b981'; // Green
      if (rating === 2) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
    }
    return 'rgba(255, 255, 255, 0.2)';
  };

  const label =
    rating === 3
      ? `Good connection (${rtt}ms, ${packetLoss}% loss)`
      : rating === 2
      ? `Fair connection (${rtt}ms, ${packetLoss}% loss)`
      : `Weak connection (${rtt}ms, ${packetLoss}% loss)`;

  return (
    <Tooltip title={label} arrow placement="top">
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'flex-end',
          gap: '2px',
          height: '14px',
          padding: '2px 4px',
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          cursor: 'pointer',
        }}
      >
        <Box sx={{ width: '3px', height: '4px', borderRadius: '1px', backgroundColor: getColor(1) }} />
        <Box sx={{ width: '3px', height: '8px', borderRadius: '1px', backgroundColor: getColor(2) }} />
        <Box sx={{ width: '3px', height: '12px', borderRadius: '1px', backgroundColor: getColor(3) }} />
      </Box>
    </Tooltip>
  );
};

