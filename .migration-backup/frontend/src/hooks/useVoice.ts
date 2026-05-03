"use client";

import { useState, useRef, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("mic unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      setError("mic access denied");
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) {
        resolve("");
        return;
      }

      mediaRecorder.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunks.current, {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          const res = await fetch(`${API_BASE}/api/voice/transcribe`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          const text = data.text || "";
          setTranscript(text);
          resolve(text);
        } catch (err) {
          setError("transcription error");
          resolve("");
        } finally {
          setIsTranscribing(false);
        }

        mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.stop();
      setIsRecording(false);
    });
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const res = await fetch(`${API_BASE}/api/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
      };
      await audio.play();
    } catch (err) {
      setIsSpeaking(false);
      setError("tts error");
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isRecording,
    isTranscribing,
    isSpeaking,
    transcript,
    error,
    clearTranscript,
    startRecording,
    stopRecording,
    speak,
  };
}
