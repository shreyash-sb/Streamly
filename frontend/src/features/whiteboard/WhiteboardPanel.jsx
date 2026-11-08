import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Slider,
  Tooltip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';

export const WhiteboardPanel = ({ onStroke, onClear, externalStrokes, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#ffffff'];

  // Handle incoming remote strokes
  useEffect(() => {
    if (!externalStrokes || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { prevX, prevY, currX, currY, strokeColor, strokeWidth } = externalStrokes;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [externalStrokes]);

  const prevCoordRef = useRef({ x: 0, y: 0 });

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const coords = getCanvasCoordinates(e);
    prevCoordRef.current = coords;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x: currX, y: currY } = getCanvasCoordinates(e);
    const { x: prevX, y: prevY } = prevCoordRef.current;

    const activeColor = isEraser ? '#111827' : color;
    const activeWidth = isEraser ? lineWidth * 3 : lineWidth;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    if (onStroke) {
      onStroke({
        prevX,
        prevY,
        currX,
        currY,
        strokeColor: activeColor,
        strokeWidth: activeWidth,
      });
    }

    prevCoordRef.current = { x: currX, y: currY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (onClear) onClear();
  };

  const exportAsPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Streamly-Whiteboard-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);
  };

  // Resize canvas to match display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth || 500;
    canvas.height = canvas.parentElement.clientHeight - 110 || 400;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <Paper
      elevation={6}
      sx={{
        width: { xs: '100%', sm: 460 },
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
          p: 1.5,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BrushIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight="bold">
            Shared Whiteboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Export as PNG">
            <IconButton size="small" onClick={exportAsPng} sx={{ color: 'text.secondary' }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Board">
            <IconButton size="small" onClick={clearCanvas} sx={{ color: 'text.secondary' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Colors */}
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {colors.map((c) => (
            <Box
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraser(false);
              }}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: c,
                cursor: 'pointer',
                border: !isEraser && color === c ? '2px solid #fff' : '1px solid rgba(0, 0, 0, 0.5)',
                transform: !isEraser && color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 150ms ease',
              }}
            />
          ))}
        </Box>

        {/* Eraser */}
        <Button
          size="small"
          variant={isEraser ? 'contained' : 'outlined'}
          color={isEraser ? 'primary' : 'inherit'}
          onClick={() => setIsEraser(!isEraser)}
          sx={{ py: 0.2, px: 1, fontSize: '0.75rem' }}
        >
          Eraser
        </Button>

        {/* Brush Size Slider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, ml: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Size
          </Typography>
          <Slider
            size="small"
            value={lineWidth}
            min={1}
            max={12}
            onChange={(e, val) => setLineWidth(val)}
            sx={{ color: 'primary.main' }}
          />
        </Box>
      </Box>

      {/* Canvas Area */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ width: '100%', height: '100%', cursor: isEraser ? 'cell' : 'crosshair', display: 'block' }}
        />
      </Box>
    </Paper>
  );
};

