import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { ThinkingVisualization } from "@/components/ThinkingVisualization";

const COMMANDER_PROMPT = "Commander: Open YouTube and search latest AI news";
const EDITH_REPLY = "EDITH: Opening YouTube...\nSearching 'latest AI news'...\nDone Commander. 3 results found.";

export function DemoWindow() {
  const [displayText, setDisplayText] = useState("");
  const [showThinking, setShowThinking] = useState(true);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | undefined;

    const startTyping = () => {
      setShowReply(true);
      let index = 0;
      intervalId = window.setInterval(() => {
        if (!mounted) return;
        index += 1;
        setDisplayText(EDITH_REPLY.slice(0, index));
        if (index >= EDITH_REPLY.length && intervalId) {
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
      </div>
      <div style={{ padding: "20px 18px 24px" }}>
        <MessageBubble type="commander" content={COMMANDER_PROMPT} securityMode={false} departmentColor="#00F0FF" />
        {showThinking && (
          <div style={{ marginLeft: 12, marginBottom: 16 }}>
            <ThinkingVisualization color="#00F0FF" />
          </div>
        )}
        {showReply && (
          <MessageBubble type="edith" content={displayText} securityMode={false} departmentColor="#00F0FF" />
        )}
      </div>
    </motion.div>
  );
}
