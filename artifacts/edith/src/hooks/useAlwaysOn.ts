import { useCallback, useEffect, useRef, useState } from 'react';

const VOLUME_THRESHOLD = 0.008;
const SILENCE_MS = 1800;
const MIN_RECORD_MS = 600;

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
      if (!data.transcript || data.transcript.length < 2) {
        setStatus('listening');
        return;
      }
      onTranscript(data.transcript, data.reply || '', data.system || 'core');
      setStatus('listening');
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
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const avg = sum / dataArray.length / 255;
    setVolume(avg);
    if (avg > VOLUME_THRESHOLD && !speakingRef.current) {
      if (!recordingRef.current) startRecording();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
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