import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = ({ speakerName = 'Me', onCaptionGenerated, defaultLang = 'en-US' }) => {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState(defaultLang);
  const [currentCaption, setCurrentCaption] = useState('');
  const [transcript, setTranscript] = useState([]);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return false;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const displayText = final || interim;
        setCurrentCaption(displayText);

        if (final && final.trim()) {
          const captionItem = {
            speaker: speakerName,
            text: final.trim(),
            timestamp: new Date().toISOString(),
          };

          setTranscript((prev) => [...prev, captionItem]);

          if (onCaptionGenerated) {
            onCaptionGenerated({
              speaker: speakerName,
              text: final.trim(),
              isFinal: true,
              lang: language,
            });
          }
        } else if (interim && onCaptionGenerated) {
          onCaptionGenerated({
            speaker: speakerName,
            text: interim.trim(),
            isFinal: false,
            lang: language,
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user still wants it listening
        if (recognitionRef.current && isListening) {
          try {
            recognition.start();
          } catch (e) {}
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      return true;
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      return false;
    }
  }, [language, speakerName, onCaptionGenerated, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCurrentCaption('');
  }, []);

  const addRemoteCaption = useCallback((caption) => {
    if (caption.isFinal && caption.text) {
      setTranscript((prev) => [
        ...prev,
        {
          speaker: caption.speaker,
          text: caption.text,
          timestamp: caption.timestamp || new Date().toISOString(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    language,
    setLanguage,
    currentCaption,
    transcript,
    addRemoteCaption,
  };
};

