import { useEffect } from 'react';

export const useShortcuts = ({
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleHandRaise,
  onToggleParticipants,
  onOpenHelp,
  enabled = true,
}) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input, textarea or contentEditable
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'm' && onToggleMute) {
        e.preventDefault();
        onToggleMute();
      } else if (key === 'v' && onToggleVideo) {
        e.preventDefault();
        onToggleVideo();
      } else if (key === 's' && onToggleScreenShare) {
        e.preventDefault();
        onToggleScreenShare();
      } else if (key === 'c' && onToggleChat) {
        e.preventDefault();
        onToggleChat();
      } else if (key === 'h' && onToggleHandRaise) {
        e.preventDefault();
        onToggleHandRaise();
      } else if (key === 'p' && onToggleParticipants) {
        e.preventDefault();
        onToggleParticipants();
      } else if (e.key === '?' && onOpenHelp) {
        e.preventDefault();
        onOpenHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onToggleMute,
    onToggleVideo,
    onToggleScreenShare,
    onToggleChat,
    onToggleHandRaise,
    onToggleParticipants,
    onOpenHelp,
  ]);
};

