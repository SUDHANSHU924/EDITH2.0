import { useState, useRef, useCallback } from "react";

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");

  const getSpeechRecognition = () => {
    const globalAny = window as any;
    return globalAny.SpeechRecognition || globalAny.webkitSpeechRecognition || null;
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    transcriptRef.current = "";

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
          const result = event.results?.[0]?.[0]?.transcript ?? "";
          transcriptRef.current = result;
          setTranscript(result);
        };
        recognition.onerror = () => {
          setError("mic access denied");
          setIsRecording(false);
          setIsTranscribing(false);
        };
        recognition.onend = () => {
          setIsRecording(false);
          setIsTranscribing(false);
        };
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        return;
      } catch {
        recognitionRef.current = null;
      }
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("mic unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      mediaRecorder.current = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      setError("mic access denied");
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (recognitionRef.current) {
        setIsTranscribing(true);
        const recognition = recognitionRef.current;
        recognition.onend = () => {
          setIsRecording(false);
          setIsTranscribing(false);
          const text = transcriptRef.current.trim();
          recognitionRef.current = null;
          resolve(text);
        };
        try {
          recognition.stop();
        } catch {
          recognitionRef.current = null;
          setIsRecording(false);
          setIsTranscribing(false);
          resolve(transcriptRef.current.trim());
        }
        return;
      }

      if (!mediaRecorder.current) { resolve(""); return; }

      mediaRecorder.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunks.current, { type: mediaRecorder.current?.mimeType || "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("language", "en");
        formData.append("prompt", "EDITH, assistant, command, system, open, close, search, voice, vision");

        try {
          // STT via Groq Whisper on jarvis-api
          const res = await fetch("/api/jarvis/voice/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          const text = data.text || "";
          setTranscript(text);
          resolve(text);
        } catch {
          setError("transcription failed");
          resolve("");
        } finally {
          setIsTranscribing(false);
        }

        mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop());
        mediaRecorder.current = null;
      };

      mediaRecorder.current.stop();
      setIsRecording(false);
    });
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text?.trim()) return;

    // Stop any currently playing audio
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }

    setIsSpeaking(true);

    try {
      window.speechSynthesis?.resume();
    } catch {}
    _browserTTS(text, () => setIsSpeaking(false));
  }, []);

  const stopSpeaking = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => {
    transcriptRef.current = "";
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
    stopSpeaking,
  };
}

function pickFemaleVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  return (
    voices.find((v) => /neerja/i.test(v.name)) ||
    voices.find((v) => /swara/i.test(v.name)) ||
    voices.find((v) => /hi-in/i.test(v.lang)) ||
    voices.find((v) => /en-in/i.test(v.lang)) ||
    voices.find((v) => /female|woman|girl|lady/i.test(v.name)) ||
    null
  );
}

/** Browser SpeechSynthesis fallback — no backend needed */
function _browserTTS(text: string, onEnd: () => void) {
  if (!window.speechSynthesis) { onEnd(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(_smoothSpeechText(text));
  utterance.rate = 0.82;
  utterance.pitch = 0.94;
  utterance.volume = 1.0;
  const speakWithVoices = () => {
    const preferred = pickFemaleVoice();
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = speakWithVoices;
    setTimeout(speakWithVoices, 250);
    return;
  }
  speakWithVoices();
}

function _smoothSpeechText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([,.!?;:])/g, "$1 <break>")
    .replace(/\b(EDITH)\b/g, "E D I T H")
    .replace(/\b(Jarvis)\b/gi, "Jarvis")
    .replace(/<break>/g, " ")
    .trim();
}
