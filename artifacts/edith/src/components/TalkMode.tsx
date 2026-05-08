import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Sparkles, Volume2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

type ChatLine = {
  role: "you" | "edith";
  text: string;
};

interface TalkModeProps {
  sessionId?: string;
  accentColor?: string;
}

function playBase64Audio(b64: string, fallbackText: string, speak: (text: string) => Promise<void>) {
  if (!b64) return;
  try {
    const bytes = atob(b64);
    const buffer = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) {
      buffer[index] = bytes.charCodeAt(index);
    }
    const audio = new Audio(URL.createObjectURL(new Blob([buffer], { type: "audio/mpeg" })));
    audio.play().catch(() => {
      if (fallbackText.trim()) {
        void speak(fallbackText);
      }
    });
  } catch {
    if (fallbackText.trim()) {
      void speak(fallbackText);
    }
  }
}

export function TalkMode({ sessionId = "commander", accentColor = "#00F0FF" }: TalkModeProps) {
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready for voice or text");
  const [error, setError] = useState<string | null>(null);
  const booted = useRef(false);
  const transcriptSent = useRef(false);

  const {
    isRecording,
    isTranscribing,
    transcript,
    error: voiceError,
    startRecording,
    stopRecording,
    clearTranscript,
    speak,
  } = useVoice();

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const controller = new AbortController();
    void fetch("/api/talk/greet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, respond_with_voice: true }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { reply?: string; audio_base64?: string };
      })
      .then((data) => {
        if (!data?.reply) return;
        setHistory([{ role: "edith", text: data.reply }]);
        setStatus("Boot greeting complete");
        if (data.audio_base64) {
          playBase64Audio(data.audio_base64, data.reply, speak);
        } else {
          void speak(data.reply);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [sessionId, speak]);

  useEffect(() => {
    if (voiceError) setError(voiceError);
  }, [voiceError]);

  const submitText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setError(null);
    setStatus("Talking to EDITH");
    setDraft("");
    setHistory((prev) => [...prev, { role: "you", text: trimmed }]);

    try {
      const res = await fetch("/api/talk/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          text: trimmed,
          respond_with_voice: true,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = (await res.json()) as { reply?: string; audio_base64?: string };
      const reply = data.reply?.trim() || "No response returned.";
      setHistory((prev) => [...prev, { role: "edith", text: reply }]);
      setStatus("Voice reply ready");

      if (data.audio_base64) {
        playBase64Audio(data.audio_base64, reply, speak);
      } else {
        void speak(reply);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Talk mode failed");
      setStatus("Offline");
    } finally {
      setBusy(false);
    }
  };

  const handleMicToggle = async () => {
    if (isRecording || isTranscribing) {
      if (transcriptSent.current) return;
      transcriptSent.current = true;
      const text = await stopRecording();
      const nextText = text || transcript;
      clearTranscript();
      transcriptSent.current = false;
      await submitText(nextText);
      return;
    }

    setError(null);
    setStatus("Listening");
    await startRecording();
  };

  const latestReply = [...history].reverse().find((line) => line.role === "edith")?.text ?? "Speak or type to begin.";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        border: `1px solid ${accentColor}22`,
        background: "linear-gradient(180deg, rgba(8,12,22,0.96), rgba(4,6,14,0.98))",
        borderRadius: 24,
        padding: 20,
        boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 24px ${accentColor}08`,
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.18em", color: `${accentColor}aa` }}>
            TALK MODE
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            Conversational voice channel for EDITH
          </div>
        </div>
        <motion.div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            border: `1px solid ${accentColor}22`,
            background: `${accentColor}08`,
            color: accentColor,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
          }}
          animate={{ opacity: busy || isRecording || isTranscribing ? [1, 0.7, 1] : 1 }}
          transition={{ duration: 1.1, repeat: Infinity }}
        >
          {isRecording ? <Mic size={12} /> : isTranscribing ? <Volume2 size={12} /> : <Sparkles size={12} />}
          {status}
        </motion.div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleMicToggle}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 14,
                border: `1px solid ${isRecording ? "#FF2A4B" : `${accentColor}30`}`,
                background: isRecording ? "rgba(255,42,75,0.12)" : `${accentColor}10`,
                color: isRecording ? "#FF2A4B" : accentColor,
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
              }}
            >
              {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
              {isRecording ? "STOP MIC" : "START MIC"}
            </button>

            <button
              onClick={() => submitText(draft)}
              disabled={busy || !draft.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 14,
                border: `1px solid ${accentColor}30`,
                background: `${accentColor}16`,
                color: accentColor,
                cursor: busy || !draft.trim() ? "default" : "pointer",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                opacity: busy || !draft.trim() ? 0.5 : 1,
              }}
            >
              <Send size={13} />
              SEND
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            placeholder="Ask EDITH anything..."
            style={{
              width: "100%",
              resize: "none",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.35)",
              color: "rgba(255,255,255,0.9)",
              padding: 14,
              outline: "none",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              minHeight: 110,
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
              SESSION {sessionId.toUpperCase()}
            </div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: error ? "#FF2A4B" : "rgba(255,255,255,0.35)" }}>
              {error || (isTranscribing ? "Transcribing voice input..." : latestReply)}
            </div>
          </div>

          <AnimatePresence>
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  display: "grid",
                  gap: 10,
                  maxHeight: 180,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {history.slice(-6).map((line, index) => (
                  <div
                    key={`${line.role}-${index}`}
                    style={{
                      alignSelf: line.role === "you" ? "end" : "start",
                      justifySelf: line.role === "you" ? "end" : "start",
                      maxWidth: "92%",
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: line.role === "you" ? `${accentColor}16` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${line.role === "you" ? `${accentColor}30` : "rgba(255,255,255,0.06)"}`,
                      color: line.role === "you" ? accentColor : "rgba(255,255,255,0.82)",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {line.text}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: `${accentColor}08`,
            border: `1px solid ${accentColor}18`,
            minHeight: 260,
          }}
        >
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.15em", color: `${accentColor}aa`, marginBottom: 10 }}>
            VOICE STATUS
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { label: "Microphone", value: isRecording ? "Recording" : "Idle" },
              { label: "Transcription", value: isTranscribing ? "In progress" : "Ready" },
              { label: "Queue", value: busy ? "Processing" : "Clear" },
              { label: "Last reply", value: latestReply.slice(0, 80) },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ color: accentColor, fontSize: 13, lineHeight: 1.5 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
