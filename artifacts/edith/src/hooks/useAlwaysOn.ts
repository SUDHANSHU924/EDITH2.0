import { useCallback, useEffect, useRef, useState } from 'react';

const VOLUME_THRESHOLD = 0.008;
const SILENCE_MS = 1800;
const MIN_RECORD_MS = 600;
const START_CONFIRMATIONS = 3;
const RESTART_COOLDOWN_MS = 900;
const NOISE_FLOOR_DECAY = 0.985;
const NOISE_FLOOR_RISE = 0.015;

export type AlwaysOnStatus = 'idle' | 'listening' | 'recording' | 'processing' | 'speaking';

export function useAlwaysOn(
  onTranscript: (text: string, reply: string, system: string) => void,
  enabled: boolean,
) {
  const [status, setStatus] = useState<AlwaysOnStatus>('idle');
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState('');

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingRef = useRef(false);
  const speakingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const recordStartRef = useRef(0);
  const noiseFloorRef = useRef(0.004);
  const speechHitRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const enabledRef = useRef(enabled);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const sendAudio = useCallback(async (blob: Blob) => {
    if (blob.size < 500) return;
    setStatus('processing');
    const form = new FormData();
    form.append('audio', blob, 'speech.webm');
    try {
      const res = await fetch('/api/orchestrator/voice', { method: 'POST', body: form });
      const data = await res.json();
      if (data.skipped || !data.transcript || data.transcript.trim().split(/\s+/).length < 2) {
        setStatus('listening');
        return;
      }

      if (data.action?.type === 'open_url' && data.action.url) {
        const popup = window.open(data.action.url, '_blank', 'noopener,noreferrer');
        if (!popup) {
          window.location.assign(data.action.url);
        }
      }
      
      // Play audio response ONLY if backend provided it
      // Do NOT call onTranscript with audio -- handle it here
      if (data.audio_base64) {
        speakingRef.current = true;
        setStatus('speaking');
        try {
          const bytes = atob(data.audio_base64);
          const arr = new Uint8Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
          const url = URL.createObjectURL(new Blob([arr], { type: 'audio/mpeg' }));
          const audio = new Audio(url);
          audio.onended = () => {
            speakingRef.current = false;
            URL.revokeObjectURL(url);
            setStatus('listening');
          };
          await audio.play();
        } catch (e) {
          console.error('Audio play error:', e);
          speakingRef.current = false;
          setStatus('listening');
        }
      } else {
        setStatus('listening');
      }
      
      // Only pass transcript + reply text for logging (NOT audio playback)
      onTranscript(data.transcript, data.reply || '', data.system || 'core');
    } catch (e) {
      console.error('Send audio error:', e);
      setStatus('listening');
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    cooldownUntilRef.current = Date.now() + RESTART_COOLDOWN_MS;
    speechHitRef.current = 0;
  }, []);

  const startRecording = useCallback(() => {
    if (recordingRef.current || speakingRef.current || !streamRef.current) return;
    recordingRef.current = true;
    recordStartRef.current = Date.now();
    chunksRef.current = [];
    setStatus('recording');
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const recorder = mimeType
        ? new MediaRecorder(streamRef.current, { mimeType })
        : new MediaRecorder(streamRef.current);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const duration = Date.now() - recordStartRef.current;
        recordingRef.current = false;
        if (duration >= MIN_RECORD_MS && chunksRef.current.length > 0) {
          sendAudio(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
        } else if (!speakingRef.current) {
          setStatus('listening');
        }
        chunksRef.current = [];
      };
      recorder.start(100);
    } catch (e) {
      console.error('Recorder error:', e);
      recordingRef.current = false;
      setStatus('listening');
    }
  }, [sendAudio]);

  const monitorVolume = useCallback(() => {
    if (!analyserRef.current || !enabledRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const centered = (dataArray[i] - 128) / 128;
      sumSquares += centered * centered;
    }
    const avg = Math.sqrt(sumSquares / dataArray.length);
    setVolume(avg);

    const isInCooldown = Date.now() < cooldownUntilRef.current;
    const startThreshold = Math.max(VOLUME_THRESHOLD, noiseFloorRef.current + NOISE_FLOOR_RISE, noiseFloorRef.current * 1.8);
    const stopThreshold = Math.max(VOLUME_THRESHOLD * 0.75, noiseFloorRef.current + 0.004, noiseFloorRef.current * 1.2);

    if (!recordingRef.current) {
      noiseFloorRef.current = Math.max(0.002, noiseFloorRef.current * NOISE_FLOOR_DECAY + avg * (1 - NOISE_FLOOR_DECAY));
      if (!isInCooldown && avg > startThreshold && !speakingRef.current) {
        speechHitRef.current += 1;
        if (speechHitRef.current >= START_CONFIRMATIONS) {
          speechHitRef.current = 0;
          startRecording();
        }
      } else if (avg <= startThreshold) {
        speechHitRef.current = 0;
      }
    } else if (avg > stopThreshold) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        silenceTimerRef.current = null;
        if (recordingRef.current) stopRecording();
      }, SILENCE_MS);
    }
    rafRef.current = requestAnimationFrame(monitorVolume);
  }, [startRecording, stopRecording]);

  const startListening = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;
      const ctx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;
      noiseFloorRef.current = 0.004;
      speechHitRef.current = 0;
      cooldownUntilRef.current = 0;
      setStatus('listening');
      rafRef.current = requestAnimationFrame(monitorVolume);
    } catch (e: any) {
      const msg = e?.message || 'Mic access denied';
      setError(msg);
      console.error('Mic error:', e);
      setStatus('idle');
    }
  }, [monitorVolume]);

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopRecording();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    speakingRef.current = false;
    recordingRef.current = false;
    speechHitRef.current = 0;
    cooldownUntilRef.current = 0;
    setStatus('idle');
    setVolume(0);
  }, [stopRecording]);

  useEffect(() => {
    if (enabled) startListening();
    else stopListening();
    return stopListening;
  }, [enabled, startListening, stopListening]);

  return { status, volume, error };
}