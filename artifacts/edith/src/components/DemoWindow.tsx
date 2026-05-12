import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Send, Terminal } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { ThinkingVisualization } from "@/components/ThinkingVisualization";
import { useVoice } from "@/hooks/useVoice";
import { createLocalEdithReply, streamLocalText } from "@/lib/localEdith";

const COMMANDER_PROMPT = "Commander: Open YouTube and search latest AI news";

export function DemoWindow() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "commander" | "edith"; text: string }>>([
    { role: "commander", text: COMMANDER_PROMPT },
  ]);
  const [displayText, setDisplayText] = useState("");
  const [showThinking, setShowThinking] = useState(true);
  const [showReply, setShowReply] = useState(false);
  const [busy, setBusy] = useState(false);
  const { isRecording, isTranscribing, transcript, error, startRecording, stopRecording, clearTranscript } = useVoice();

  useEffect(() => {
    let mounted = true;
    let intervalId: number | undefined;
    const local = createLocalEdithReply(COMMANDER_PROMPT);

    const startTyping = () => {
      setShowReply(true);
      let index = 0;
      intervalId = window.setInterval(() => {
        if (!mounted) return;
        index += 1;
        setDisplayText(local.reply.slice(0, index));
        if (index >= local.reply.length && intervalId) {
          window.clearInterval(intervalId);
        }
      }, 18);
    };

    const thinkingTimer = window.setTimeout(() => {
      if (!mounted) return;
      setShowThinking(false);
      startTyping();
    }, 900);

    return () => {
      mounted = false;
      window.clearTimeout(thinkingTimer);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  const submitDemo = async (input: string) => {
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);
    setDraft("");
    setMessages((prev) => [...prev, { role: "commander", text }]);
    setMessages((prev) => [...prev, { role: "edith", text: "" }]);

    const local = createLocalEdithReply(text);
    setShowThinking(true);
    setShowReply(true);
    setDisplayText("");

    streamLocalText(
      local.reply,
      (chunk) => {
        setDisplayText((prev) => prev + chunk);
      },
      () => {
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === "edith") {
            next[lastIndex] = { role: "edith", text: local.reply };
          }
          return next;
        });
        if (local.action?.type === "open_url") {
          window.open(local.action.url, "_blank", "noopener,noreferrer");
        }
        setShowThinking(false);
        setBusy(false);
      }
    );
  };

  const handleMic = async () => {
    if (isRecording || isTranscribing) {
      const text = await stopRecording();
      clearTranscript();
      await submitDemo(text || transcript);
      return;
    }

    await startRecording();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: 20,
        border: "1px solid rgba(0,240,255,0.18)",
        background: "rgba(8,12,22,0.9)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(6,10,18,0.9)",
        }}
      >
        <Terminal size={14} color="#00F0FF" />
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>
          LIVE COMMAND STREAM
        </span>
        <span style={{ marginLeft: "auto", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(0,240,255,0.7)" }}>
          LOCAL DEMO MODE
        </span>
      </div>
      <div style={{ padding: "20px 18px 24px" }}>
        <div style={{ display: "grid", gap: 12 }}>
          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.role}-${index}`}
              type={message.role === "commander" ? "commander" : "edith"}
              content={message.role === "edith" && index === messages.length - 1 ? displayText || message.text : message.text}
              securityMode={false}
              departmentColor="#00F0FF"
            />
          ))}

          {showThinking && (
            <div style={{ marginLeft: 12, marginBottom: 4 }}>
              <ThinkingVisualization color="#00F0FF" />
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              borderRadius: 16,
              border: "1px solid rgba(0,240,255,0.18)",
              background: "rgba(255,255,255,0.03)",
              padding: 10,
            }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a command for the local demo..."
              rows={2}
              style={{
                flex: 1,
                resize: "none",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                minHeight: 44,
              }}
            />
            <button
              type="button"
              onClick={handleMic}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minWidth: 48,
                minHeight: 44,
                borderRadius: 12,
                border: `1px solid ${isRecording ? "#FF2A4B" : "rgba(0,240,255,0.22)"}`,
                background: isRecording ? "rgba(255,42,75,0.12)" : "rgba(0,240,255,0.08)",
                color: isRecording ? "#FF2A4B" : "#00F0FF",
                cursor: "pointer",
              }}
              aria-label="Toggle microphone"
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button
              type="button"
              onClick={() => submitDemo(draft || transcript)}
              disabled={busy || !(draft.trim() || transcript.trim())}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 44,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                cursor: busy || !(draft.trim() || transcript.trim()) ? "default" : "pointer",
                opacity: busy || !(draft.trim() || transcript.trim()) ? 0.5 : 1,
              }}
            >
              <Send size={14} />
            </button>
          </div>

          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: error ? "#FF2A4B" : "rgba(255,255,255,0.4)" }}>
            {error || (isTranscribing ? "Listening..." : "Free during beta · Demo input is local and ready")}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
