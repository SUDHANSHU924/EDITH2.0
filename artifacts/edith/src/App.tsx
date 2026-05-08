import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, ChevronUp, ChevronDown } from "lucide-react";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { HudStatusBar } from "@/components/HudStatusBar";
import { SecurityModeOverlay } from "@/components/SecurityModeOverlay";
import { OrbitSidebar } from "@/components/OrbitSidebar";
import { CommandInput } from "@/components/CommandInput";
import { AlwaysOnIndicator } from "@/components/AlwaysOnIndicator";
import { MessageBubble } from "@/components/MessageBubble";
import { PeripherySidebar } from "@/components/PeripherySidebar";
import { ThinkingVisualization } from "@/components/ThinkingVisualization";
import { useOrchestrator } from "@/hooks/useOrchestrator";
import { useVoice } from "@/hooks/useVoice";
import { useChatStore } from "@/store/chatStore";
import { checkHealth } from "@/lib/api";
import {
  DEPARTMENTS,
  type DepartmentId,
} from "@/departments";
import type { Attachment } from "@/types/message.types";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient();

const BOOT_MESSAGE = `EDITH 2.0 — Online. Commander recognized.
All 15 systems initialized and standing by.
How can I serve you today?`;

function playBase64Audio(b64: string) {
  try {
    const bytes = atob(b64);
    const buf = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
    const blob = new Blob([buf], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    audio.muted = false;
    audio.volume = 1;
    void audio.play().catch(() => {
      URL.revokeObjectURL(url);
    });
  } catch {}
}

const AUTONOMY_STAGES = [
  { stage: 1, label: "DIRECTED", desc: "Commander specifies every task explicitly" },
  { stage: 2, label: "DELEGATED", desc: "Commander sets objectives; EDITH executes" },
  { stage: 3, label: "PROACTIVE", desc: "EDITH anticipates and suggests actions" },
  { stage: 4, label: "MANAGED", desc: "EDITH handles routine, escalates decisions" },
];

function LandingPage() {
  const [, navigate] = useLocation();
  const [booting, setBooting] = useState(false);

  const handleInit = () => {
    setBooting(true);
    setTimeout(() => navigate("/commander"), 1200);
  };

  return (
    <div
      style={{
        background: "#050505",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "JetBrains Mono, monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundGrid />

      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ textAlign: "center", zIndex: 10 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            color: "rgba(0,240,255,0.4)",
            fontSize: "10px",
            letterSpacing: "0.4em",
            marginBottom: "24px",
          }}
        >
          STARK INDUSTRIES — RESTRICTED
        </motion.div>

        <motion.h1
          style={{
            color: "#00F0FF",
            fontSize: "56px",
            letterSpacing: "0.3em",
            fontWeight: 300,
            textShadow: "0 0 40px rgba(0,240,255,0.4)",
            marginBottom: "8px",
          }}
          animate={{
            textShadow: [
              "0 0 30px rgba(0,240,255,0.3)",
              "0 0 50px rgba(0,240,255,0.6)",
              "0 0 30px rgba(0,240,255,0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          E.D.I.T.H.
        </motion.h1>

        <p style={{ color: "rgba(255,255,255,0.3)", marginBottom: "4px", fontSize: "11px", letterSpacing: "0.2em" }}>
          AUTONOMOUS INTELLIGENCE SYSTEM
        </p>
        <p style={{ color: "rgba(255,255,255,0.15)", marginBottom: "48px", fontSize: "10px", letterSpacing: "0.15em" }}>
          VERSION 2.0 · OS CONTROL AGENT ONLINE
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: "flex", gap: "24px", justifyContent: "center", marginBottom: "48px" }}
        >
          {[
            { label: "NEURAL NET", status: "ONLINE" },
            { label: "OS CONTROL", status: "ARMED" },
            { label: "CLEARANCE", status: "ALPHA" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <motion.div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#00F0FF",
                  margin: "0 auto 6px",
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>{item.label}</div>
              <div style={{ fontSize: "9px", color: "rgba(0,240,255,0.6)", letterSpacing: "0.1em" }}>{item.status}</div>
            </div>
          ))}
        </motion.div>

        <motion.button
          onClick={handleInit}
          disabled={booting}
          style={{
            border: "1px solid #00F0FF",
            background: booting ? "rgba(0,240,255,0.1)" : "transparent",
            color: "#00F0FF",
            padding: "14px 48px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            letterSpacing: "0.25em",
            cursor: booting ? "default" : "pointer",
            position: "relative",
            overflow: "hidden",
          }}
          whileHover={{ background: "rgba(0,240,255,0.08)", boxShadow: "0 0 20px rgba(0,240,255,0.2)" }}
          whileTap={{ scale: 0.98 }}
        >
          {booting ? (
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}>
              INITIALIZING...
            </motion.span>
          ) : (
            "INITIALIZE SYSTEM"
          )}
        </motion.button>
      </motion.div>

      {[
        { top: 24, left: 24 },
        { top: 24, right: 24 },
        { bottom: 24, left: 24 },
        { bottom: 24, right: 24 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            borderTop: i < 2 ? "1px solid rgba(0,240,255,0.25)" : undefined,
            borderBottom: i >= 2 ? "1px solid rgba(0,240,255,0.25)" : undefined,
            borderLeft: i % 2 === 0 ? "1px solid rgba(0,240,255,0.25)" : undefined,
            borderRight: i % 2 === 1 ? "1px solid rgba(0,240,255,0.25)" : undefined,
            ...pos,
          }}
        />
      ))}
    </div>
  );
}

function CommanderPage() {
  const [, navigate] = useLocation();
  const [securityMode, setSecurityMode] = useState(false);
  const [showSecurityOverlay, setShowSecurityOverlay] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>("core");
  const [autonomyStage, setAutonomyStage] = useState(1);
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  const allMessages = useChatStore((state) => state.messages);
  const getMessagesFunc = useChatStore((state) => state.getMessages);
  const setCurrentDepartmentInStore = useChatStore((state) => state.setCurrentDepartment);
  const chatMessages = useMemo(
    () => (getMessagesFunc ? getMessagesFunc(activeDepartment) : []),
    [activeDepartment, allMessages, getMessagesFunc]
  );

  const {
    sendMessage,
    isThinking,
    wsConnected,
    activeSystem,
    lastRouting,
    taskLog,
    contextTurns,
    tasksCompleted,
  } = useOrchestrator(sessionId, activeDepartment);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageScrollRef = useRef<HTMLDivElement>(null);

  const currentDept = DEPARTMENTS.find((d) => d.id === activeDepartment)!;
  const accentColor = securityMode ? "#FF2A4B" : currentDept.color;

  const addMessage = useChatStore((s) => s.addMessage);
  const { speak } = useVoice();

  // Boot greeting — fetch dynamic AI greeting from talk agent, fallback to static
  useEffect(() => {
    if (chatMessages.length > 0) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/talk/greet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, respond_with_voice: true }),
          signal: controller.signal,
        });
        const bootText = res.ok ? (await res.json()).reply || BOOT_MESSAGE : BOOT_MESSAGE;
        addMessage({ role: "assistant", content: bootText, timestamp: new Date().toISOString() }, "core");
        void speak(bootText);
      } catch {
        addMessage({ role: "assistant", content: BOOT_MESSAGE, timestamp: new Date().toISOString() }, "core");
        void speak(BOOT_MESSAGE);
      }
    }, 1200);
    return () => { controller.abort(); clearTimeout(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Backend health check
  useEffect(() => {
    checkHealth()
      .then((online) => {
        if (!online) console.warn("[EDITH] backend offline");
      })
      .catch((err: unknown) => {
        console.error("[EDITH] backend connection error:", err instanceof Error ? err.message : err);
      });
  }, []);

  // Sync department with store
  useEffect(() => {
    setCurrentDepartmentInStore(activeDepartment);
  }, [activeDepartment, setCurrentDepartmentInStore]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, autoScroll]);

  // Close stage menu on outside click
  useEffect(() => {
    const handler = () => setShowStageMenu(false);
    if (showStageMenu) window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [showStageMenu]);

  const displayMessages =
    chatMessages.length === 0
       ? [{ id: 1, type: "edith" as const, content: BOOT_MESSAGE, isThinking: false, departmentColor: "#00F0FF", attachments: undefined, kind: undefined, screenshot_base64: undefined }]
      : chatMessages.map((m, index) => ({
          id: m.id ?? index,
          type: (m.role === "user" ? "commander" : "edith") as "commander" | "edith",
          content: m.content ?? "",
          isThinking: m.isStreaming,
          departmentColor: currentDept.color,
          attachments: m.attachments,
          kind: m.kind,
          screenshot_base64: m.screenshot_base64,
        }));

  const handleDepartmentChange = (deptId: DepartmentId) => {
    if (deptId === activeDepartment) return;
    setActiveDepartment(deptId);
  };

  const handleSecurityToggle = () => {
    if (!securityMode) {
      setShowSecurityOverlay(true);
    } else {
      setSecurityMode(false);
    }
  };

  const handleSecurityOverlayComplete = () => {
    setShowSecurityOverlay(false);
    setSecurityMode(true);
    setActiveDepartment("security");
  };

  const handleCommanderOverride = () => {
    if (securityMode) {
      setSecurityMode(false);
      setActiveDepartment("core");
    }
    useChatStore.getState().addMessage(
      {
        role: "assistant",
        content: "⚠️ Commander Override Protocol activated. All autonomous operations halted. Awaiting explicit directive.",
        timestamp: new Date().toISOString(),
      },
      "core"
    );
  };

  const handleAlwaysOnConversation = (transcript: string, reply: string, _system: string) => {
    addMessage({ role: "user", content: transcript, timestamp: new Date().toISOString() }, activeDepartment);
    addMessage({ role: "assistant", content: reply, timestamp: new Date().toISOString() }, activeDepartment);
    // Audio playback is handled by useAlwaysOn hook via backend audio_base64
    // Do NOT call speak(reply) here to avoid double-speak
    setAutoScroll(true);
  };

  const handleSendMessage = (content: string, attachments?: Attachment[], voiceResponse?: boolean) => {
    if (content.toLowerCase().includes("/engage-security-grid")) {
      setShowSecurityOverlay(true);
      return;
    }
    if (content.toLowerCase() === "shutdown") {
      useChatStore.getState().clearMessages(activeDepartment);
      useChatStore.getState().addMessage(
        { role: "assistant", content: "// STANDING BY — Commander Override Received.", timestamp: new Date().toISOString() },
        activeDepartment
      );
      return;
    }
    setAutoScroll(true);
    sendMessage(content, attachments, voiceResponse);
  };

  const handleMessageScroll = () => {
    const container = messageScrollRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setAutoScroll(distanceFromBottom < 120);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#050505", display: "flex", flexDirection: "column" }}>
      <BackgroundGrid />

      <HudStatusBar
        securityMode={securityMode}
        activeDepartment={activeDepartment}
        autonomyStage={autonomyStage}
        accentColor={accentColor}
        wsConnected={wsConnected}
        activeSystem={activeSystem}
      />

      <AnimatePresence>
        {showSecurityOverlay && (
          <SecurityModeOverlay onComplete={handleSecurityOverlayComplete} />
        )}
      </AnimatePresence>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Left: The ORBIT */}
        <div style={{ flexShrink: 0, height: "100%", zIndex: 10, position: "relative" }}>
          <OrbitSidebar
            securityMode={securityMode}
            onSecurityToggle={handleSecurityToggle}
            activeDepartment={activeDepartment}
            onDepartmentChange={handleDepartmentChange}
          />
        </div>

        {/* Center: The HORIZON */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative" }}>

          {/* HUD corner brackets */}
          {([
            { top: 10, left: 10 },
            { top: 10, right: 10 },
            { bottom: 10, left: 10 },
            { bottom: 10, right: 10 },
          ] as const).map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 16, height: 16, zIndex: 5, pointerEvents: 'none',
              borderTop:    i < 2  ? `1px solid ${accentColor}28` : undefined,
              borderBottom: i >= 2 ? `1px solid ${accentColor}28` : undefined,
              borderLeft:  i % 2 === 0 ? `1px solid ${accentColor}28` : undefined,
              borderRight: i % 2 === 1 ? `1px solid ${accentColor}28` : undefined,
              ...pos,
            }} />
          ))}

          {/* Department header */}
          <div
            className="flex items-center justify-between px-7 py-3.5 flex-shrink-0"
            style={{ borderBottom: `1px solid ${accentColor}14`, position: 'relative', overflow: 'hidden' }}
          >
            <motion.div
              style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 2,
                background: `linear-gradient(180deg, transparent, ${accentColor}70, transparent)`,
                boxShadow: `0 0 12px ${accentColor}50`,
              }}
              animate={{ x: ['-10px', '1000px'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 12 }}
            />

            {/* Left: dept identity */}
            <div className="flex items-center gap-4">
              <div style={{ position: 'relative', flexShrink: 0, width: 36, height: 36, margin: '10px' }}>
                <div
                  className="animate-rotate-ring"
                  style={{
                    position: 'absolute', inset: -12, borderRadius: '50%',
                    border: `1.5px solid ${accentColor}60`,
                    boxShadow: `0 0 12px ${accentColor}20`,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '50%', right: -4, transform: 'translateY(-50%)',
                    width: 7, height: 7, borderRadius: '50%',
                    background: accentColor,
                    boxShadow: `0 0 14px ${accentColor}, 0 0 6px ${accentColor}, 0 0 2px #fff`,
                  }} />
                </div>
                <div
                  className="animate-rotate-ring-reverse"
                  style={{
                    position: 'absolute', inset: -5, borderRadius: '50%',
                    border: `1px dashed ${accentColor}35`,
                  }}
                />
                <motion.div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}60`, position: 'relative', zIndex: 1 }}
                  animate={{ boxShadow: [`0 0 0px ${accentColor}00`, `0 0 28px ${accentColor}80`, `0 0 0px ${accentColor}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  {(() => { const Icon = currentDept.icon; return <Icon size={17} style={{ color: accentColor }} />; })()}
                </motion.div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                    MODULE {currentDept.moduleNum}
                  </span>
                  <span style={{ color: accentColor + "60", fontSize: "7px" }}>◆</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: accentColor + "bb", letterSpacing: "0.05em" }}>
                    {securityMode ? "TACTICAL MODE ACTIVE" : currentDept.subtitle.toUpperCase()}
                  </span>
                </div>
                <div className="text-white" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "15px" }}>
                  EDITH 2.0 <span style={{ color: accentColor }}>// {currentDept.label}</span>
                </div>
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-1">
                {DEPARTMENTS.slice(0, 5).map((dept) => (
                  <motion.button
                    key={dept.id}
                    className="px-2 py-0.5 rounded text-xs transition-all"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "9px",
                      color: activeDepartment === dept.id ? dept.color : "rgba(255,255,255,0.22)",
                      border: `1px solid ${activeDepartment === dept.id ? dept.color + "40" : "rgba(255,255,255,0.05)"}`,
                      background: activeDepartment === dept.id ? dept.color + "10" : "transparent",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDepartmentChange(dept.id)}
                  >
                    {dept.shortLabel}
                  </motion.button>
                ))}
              </div>

              <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.07)" }} />

              {/* Autonomy stage selector */}
              <div className="relative">
                <motion.button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: `${accentColor}0e`,
                    border: `1px solid ${accentColor}28`,
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "9px",
                    color: accentColor + "cc",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); setShowStageMenu(!showStageMenu); }}
                >
                  <span style={{ letterSpacing: "0.05em" }}>
                    S{autonomyStage} · {AUTONOMY_STAGES[autonomyStage - 1].label}
                  </span>
                  {showStageMenu ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                </motion.button>

                <AnimatePresence>
                  {showStageMenu && (
                    <motion.div
                      className="absolute top-9 right-0 z-50 min-w-[220px] rounded-xl overflow-hidden"
                      style={{
                        background: "rgba(8,12,22,0.97)",
                        border: `1px solid ${accentColor}25`,
                        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${accentColor}10`,
                        backdropFilter: "blur(16px)",
                      }}
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                          AUTONOMY STAGE
                        </span>
                      </div>
                      {AUTONOMY_STAGES.map((s) => (
                        <motion.button
                          key={s.stage}
                          className="w-full flex items-start gap-3 px-3 py-2.5 text-left"
                          style={{
                            background: autonomyStage === s.stage ? `${accentColor}0e` : "transparent",
                            borderLeft: autonomyStage === s.stage ? `2px solid ${accentColor}` : "2px solid transparent",
                          }}
                          whileHover={{ background: `${accentColor}08` }}
                          onClick={() => { setAutonomyStage(s.stage); setShowStageMenu(false); }}
                        >
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
                            style={{
                              background: autonomyStage === s.stage ? `${accentColor}25` : "rgba(255,255,255,0.05)",
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: "9px",
                              color: autonomyStage === s.stage ? accentColor : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {s.stage}
                          </span>
                          <div>
                            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: autonomyStage === s.stage ? accentColor : "rgba(255,255,255,0.6)" }}>
                              {s.label}
                            </div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "1px" }}>
                              {s.desc}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                      <div className="px-3 py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
                          Commander Override available at all stages.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Always-On voice mode */}
              <AlwaysOnIndicator
                onConversation={handleAlwaysOnConversation}
                accentColor={accentColor}
              />

              <motion.button
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "rgba(0,240,255,0.06)",
                  border: "1px solid rgba(0,240,255,0.16)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  color: "rgba(0,240,255,0.78)",
                  letterSpacing: "0.05em",
                }}
                whileHover={{ scale: 1.03, background: "rgba(0,240,255,0.12)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dashboard")}
                title="Open dashboard view"
              >
                <ChevronUp size={10} />
                DASHBOARD
              </motion.button>

              <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.07)" }} />

              {/* Commander override */}
              <motion.button
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "rgba(255,42,75,0.06)",
                  border: "1px solid rgba(255,42,75,0.2)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  color: "rgba(255,42,75,0.7)",
                  letterSpacing: "0.05em",
                }}
                whileHover={{ scale: 1.03, background: "rgba(255,42,75,0.12)", borderColor: "rgba(255,42,75,0.4)", color: "#FF2A4B" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCommanderOverride}
                title="Commander Override — halt all autonomous operations"
              >
                <AlertOctagon size={10} />
                OVERRIDE
              </motion.button>

              {/* Security mode badge */}
              <AnimatePresence>
                {securityMode && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,42,75,0.08)", border: "1px solid rgba(255,42,75,0.28)" }}
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#FF2A4B" }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "#FF2A4B", letterSpacing: "0.06em" }}>
                      ETHICAL HACKER
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messageScrollRef}
            onScroll={handleMessageScroll}
            className="flex-1 overflow-y-auto px-7 py-6 pb-44 horizon-scroll"
            style={{ minHeight: 0 }}
          >
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              {displayMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  type={message.type}
                  content={message.content}
                  isThinking={message.isThinking}
                  securityMode={securityMode}
                  departmentColor={message.departmentColor ?? currentDept.color}
                  attachments={message.attachments}
                  kind={message.kind}
                  screenshot_base64={message.screenshot_base64}
                />
              ))}
              {isThinking && chatMessages.length > 0 && chatMessages[chatMessages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="max-w-3xl">
                    <ThinkingVisualization color={accentColor} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Command Input */}
          <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", zIndex: 20 }}>
            <CommandInput
              onSendMessage={handleSendMessage}
              onDepartmentChange={handleDepartmentChange}
              securityMode={securityMode}
              activeDepartment={activeDepartment}
              departmentColor={accentColor}
            />
          </div>
        </div>

        {/* Right: The PERIPHERY */}
        <div style={{ flexShrink: 0, width: "320px", height: "100%", overflowY: "auto", borderLeft: "1px solid rgba(0,240,255,0.08)" }}>
          <PeripherySidebar
            securityMode={securityMode}
            activeDepartment={activeDepartment}
            wsConnected={wsConnected}
            activeSystem={activeSystem}
            lastRouting={lastRouting}
            taskLog={taskLog}
            contextTurns={contextTurns}
            tasksCompleted={tasksCompleted}
          />
        </div>
      </div>

      <style>{`
        .horizon-scroll::-webkit-scrollbar { width: 3px; }
        .horizon-scroll::-webkit-scrollbar-track { background: transparent; }
        .horizon-scroll::-webkit-scrollbar-thumb { background: ${accentColor}30; border-radius: 2px; }
        .horizon-scroll::-webkit-scrollbar-thumb:hover { background: ${accentColor}55; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/commander" component={CommanderPage} />
      <Route path="/dashboard" component={Dashboard} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
