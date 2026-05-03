import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LayoutDashboard, MessageSquare, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { JarvisPanel } from "@/components/JarvisPanel";
import { TalkMode } from "@/components/TalkMode";
import { useOrchestrator } from "@/hooks/useOrchestrator";

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: `1px solid ${accent}22`,
        background: "rgba(255,255,255,0.03)",
        padding: 16,
        minHeight: 92,
      }}
    >
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ color: accent, fontSize: 18, lineHeight: 1.25 }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [sessionId] = useState(() => `dashboard-${Date.now()}`);
  const { activeSystem, contextTurns, tasksCompleted, wsConnected, taskLog } = useOrchestrator(sessionId, "core");

  useEffect(() => {
    document.title = "EDITH Dashboard";
  }, []);

  const accent = "#00F0FF";

  return (
    <div style={{ minHeight: "100vh", background: "#05070d", color: "white", position: "relative", overflow: "hidden" }}>
      <BackgroundGrid />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at top left, rgba(0,240,255,0.14), transparent 35%), radial-gradient(circle at top right, rgba(123,97,255,0.12), transparent 28%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: 24, maxWidth: 1600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <LayoutDashboard size={18} color={accent} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.18em", fontSize: 10, color: `${accent}aa` }}>
                COMMAND DASHBOARD
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "0.03em" }}>EDITH 2.0 Operational Overview</h1>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.38)", maxWidth: 720 }}>
              Voice, autonomy, and system orchestration live in one control surface.
            </p>
          </div>

          <button
            onClick={() => navigate("/commander")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 16px",
              borderRadius: 14,
              border: `1px solid ${accent}2a`,
              background: "rgba(255,255,255,0.03)",
              color: accent,
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
            }}
          >
            <ArrowLeft size={14} />
            COMMANDER VIEW
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <TalkMode sessionId={sessionId} accentColor={accent} />

            <div
              style={{
                borderRadius: 24,
                padding: 20,
                border: `1px solid ${accent}18`,
                background: "rgba(8,12,22,0.92)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.16em", color: `${accent}aa` }}>
                    SYSTEM METRICS
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.34)", fontSize: 12, marginTop: 4 }}>
                    Live orchestrator and routing summary
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: wsConnected ? "#2FD4A3" : "#FF2A4B", fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>
                  <Sparkles size={12} />
                  {wsConnected ? "CONNECTED" : "DISCONNECTED"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
                <MetricCard label="Active system" value={activeSystem.toUpperCase()} accent={accent} />
                <MetricCard label="Conversation turns" value={String(contextTurns)} accent={accent} />
                <MetricCard label="Tasks completed" value={String(tasksCompleted)} accent={accent} />
                <MetricCard label="Recent tasks" value={String(taskLog.length)} accent={accent} />
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: "grid", gap: 18 }}
          >
            <div
              style={{
                borderRadius: 24,
                padding: 20,
                border: `1px solid ${accent}18`,
                background: "rgba(8,12,22,0.92)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <MessageSquare size={16} color={accent} />
                <div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.16em", color: `${accent}aa` }}>
                    AUTONOMOUS AGENT
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.34)", fontSize: 12, marginTop: 4 }}>
                    Jarvis task execution and self-upgrade controls
                  </div>
                </div>
              </div>
              <JarvisPanel color={accent} />
            </div>

            <div
              style={{
                borderRadius: 24,
                padding: 20,
                border: `1px solid ${accent}18`,
                background: "rgba(8,12,22,0.92)",
              }}
            >
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.16em", color: `${accent}aa`, marginBottom: 12 }}>
                CONTROL NOTES
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.52)", lineHeight: 1.7, fontSize: 13 }}>
                <li>Talk Mode speaks through the `/api/talk` router and can be driven by voice or text.</li>
                <li>The dashboard uses the same orchestrator session flow as commander view, so status stays in sync.</li>
                <li>New status routes are exposed at `/api/search/status`, `/api/code/status`, `/api/hacker/status`, and `/api/satellite/status`.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
