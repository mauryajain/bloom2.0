// ============================================================
// BLOOM — Voice Journaling Hook
// Uses Web Speech API for speech-to-text
// ============================================================

import { useState, useRef, useCallback } from 'react';

// Extend the Window type for SpeechRecognition (not yet in all TS libs)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-available'
  | 'bad-grammar'
  | 'language-not-supported';

interface SpeechRecognitionErrorEvent {
  error: SpeechRecognitionErrorCode;
  message: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'done' | 'error';

export interface UseVoiceJournalReturn {
  voiceState: VoiceState;
  transcript: string;
  error: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetVoice: () => void;
}

export function useVoiceJournal(): UseVoiceJournalReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  // Check browser support
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      setVoiceState('error');
      return;
    }

    setTranscript('');
    setError('');
    setVoiceState('listening');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript((finalTranscript + interimTranscript).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VoiceJournal] Speech error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again and speak clearly.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setVoiceState('error');
    };

    recognition.onend = () => {
      if (voiceState === 'listening') {
        // User manually stopped or recognition ended naturally
        setVoiceState(finalTranscript.trim() ? 'processing' : 'idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (transcript.trim()) {
      setVoiceState('processing');
    } else {
      setVoiceState('idle');
    }
  }, [transcript]);

  const resetVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setVoiceState('idle');
    setTranscript('');
    setError('');
  }, []);

  return {
    voiceState,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetVoice,
  };
}
