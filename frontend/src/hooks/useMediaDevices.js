import { useState, useEffect, useCallback, useRef } from 'react';

export const useMediaDevices = () => {
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);

  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');

  const [permissionError, setPermissionError] = useState(null);
  const streamRef = useRef(null);

  const getDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioIn = devices.filter((d) => d.kind === 'audioinput');
      const videoIn = devices.filter((d) => d.kind === 'videoinput');
      const audioOut = devices.filter((d) => d.kind === 'audiooutput');

      setAudioDevices(audioIn);
      setVideoDevices(videoIn);
      setAudioOutputs(audioOut);

      if (audioIn.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioIn[0].deviceId);
      }
      if (videoIn.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoIn[0].deviceId);
      }
      if (audioOut.length > 0 && !selectedAudioOutput) {
        setSelectedAudioOutput(audioOut[0].deviceId);
      }
    } catch (err) {
      console.warn('Error enumerating devices:', err);
    }
  }, [selectedAudioDevice, selectedVideoDevice, selectedAudioOutput]);

  const getMediaStream = useCallback(
    async ({ video = true, audio = true, videoId = null, audioId = null, lowBandwidth = false }) => {
      setPermissionError(null);

      const videoConstraints = video
        ? {
            deviceId: videoId ? { exact: videoId } : undefined,
            width: lowBandwidth ? { ideal: 640, max: 640 } : { ideal: 1280, max: 1920 },
            height: lowBandwidth ? { ideal: 360, max: 360 } : { ideal: 720, max: 1080 },
            frameRate: lowBandwidth ? { max: 15 } : { ideal: 30, max: 30 },
          }
        : false;

      const audioConstraints = audio
        ? {
            deviceId: audioId ? { exact: audioId } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : false;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints,
        });
        streamRef.current = stream;
        await getDevices();
        return stream;
      } catch (err) {
        console.error('getUserMedia error:', err);
        setPermissionError(err.name || 'PermissionDenied');

        // Fallback: If both requested and video failed, try audio only
        if (video && audio) {
          try {
            console.log('Attempting audio-only fallback...');
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: audioConstraints,
            });
            streamRef.current = audioOnlyStream;
            return audioOnlyStream;
          } catch (audioErr) {
            console.error('Audio-only fallback also failed:', audioErr);
            throw audioErr;
          }
        }
        throw err;
      }
    },
    [getDevices]
  );

  useEffect(() => {
    getDevices();

    const handleDeviceChange = () => {
      console.log('Media devices changed, re-enumerating...');
      getDevices();
    };

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [getDevices]);

  return {
    audioDevices,
    videoDevices,
    audioOutputs,
    selectedAudioDevice,
    setSelectedAudioDevice,
    selectedVideoDevice,
    setSelectedVideoDevice,
    selectedAudioOutput,
    setSelectedAudioOutput,
    getMediaStream,
    permissionError,
  };
};

