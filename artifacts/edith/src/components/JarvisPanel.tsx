import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface JarvisStep {
  type: "thought" | "action" | "observation" | "answer" | "error";
  content: string;
  ts: string;
}

interface JarvisResult {
  completed: boolean;
  answer: string;
  actions: string[];
  thoughts: string[];
  steps_taken: number;
  elapsed_seconds: number;
  model_used: string;
  tokens?: number;
}

interface SelfUpgradeResult {
  success: boolean;
  new_version: string;
  improvement: string;
  message: string;
}

const JARVIS_URL = "/api/jarvis";
const EDITH_URL = "/api/edith";

export function JarvisPanel({ color }: { color?: string }) {
  const [task, setTask] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<JarvisStep[]>([]);
  const [result, setResult] = useState<JarvisResult | null>(null);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [upgradeMode, setUpgradeMode] = useState(false);
  const [upgradeFeedback, setUpgradeFeedback] = useState("");
  const [upgradeResult, setUpgradeResult] = useState<SelfUpgradeResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = color || "#00F0FF";

  useEffect(() => {
    fetch(`${JARVIS_URL}/status`)
      .then(r => r.json())
      .then(setStatus)
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  const addStep = (type: JarvisStep["type"], content: string) => {
    setSteps(prev => [...prev, { type, content, ts: new Date().toLocaleTimeString() }]);
  };

  const runTask = async () => {
    if (!task.trim() || running) return;
    setRunning(true);
    setSteps([]);
    setResult(null);
    const t0 = Date.now();

    addStep("thought", `Initializing EDITH autonomous agent for: "${task}"`);
    addStep("observation", "Routing to Jarvis reasoning engine (Groq LLM)...");

    try {
      const res = await fetch(`${JARVIS_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, max_tokens: 1024 }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data: JarvisResult = await res.json();
      const elapsed = Math.round((Date.now() - t0) / 1000);

      data.thoughts?.forEach(t => addStep("thought", t));
      data.actions?.forEach(a => addStep("action", a));
      if (data.answer) addStep("answer", data.answer);

      setResult({ ...data, elapsed_seconds: elapsed });
    } catch (err) {
      addStep("error", `System error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setRunning(false);
    }
  };

  const runSelfUpgrade = async () => {
    if (!upgradeFeedback.trim()) return;
    setRunning(true);
    setUpgradeResult(null);
    try {
      const res = await fetch(`${EDITH_URL}/self-upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: upgradeFeedback, department: "core" }),
      });
      const data = await res.json() as SelfUpgradeResult;
      setUpgradeResult(data);
    } catch (err) {
      setUpgradeResult({ success: false, new_version: "—", improvement: "", message: String(err) });
    } finally {
      setRunning(false);
    }
  };

  const stepColors: Record<JarvisStep["type"], string> = {
    thought: `rgba(0,240,255,0.7)`,
    action: "rgba(255,170,0,0.9)",
    observation: "rgba(50,212,163,0.7)",
    answer: accent,
    error: "#FF2A4B",
  };

  const stepIcons: Record<JarvisStep["type"], string> = {
    thought: "◈",
    action: "▶",
    observation: "○",
    answer: "★",
    error: "✕",
  };

  const isConfigured = status && (status["groq_configured"] || status["nvidia_configured"]);
  const totalCalls = status?.["total_calls"] as number | undefined;
  const version = status?.["version"] as string | undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: `${accent}80` }}>
            EDITH AUTONOMOUS AGENT
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
            {version ? `v${version}` : "v2.0"} · DeepSeek R1 + LLaMA 70B · {totalCalls ?? 0} ops logged
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => { setUpgradeMode(u => !u); setUpgradeResult(null); }}
            style={{
              fontSize: 8,
              letterSpacing: "0.12em",
              color: upgradeMode ? accent : "rgba(255,255,255,0.3)",
              background: upgradeMode ? `${accent}12` : "transparent",
              border: `1px solid ${upgradeMode ? `${accent}40` : "rgba(255,255,255,0.1)"}`,
              padding: "3px 8px",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
              transition: "all 0.2s",
            }}
          >
            ↑ SELF-UPGRADE
          </button>
          <motion.div
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isConfigured ? "#2FD4A3" : "#FF2A4B",
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>

      {/* ── Self-Upgrade Panel ─────────────────────────────── */}
      <AnimatePresence>
        {upgradeMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{
              background: `${accent}06`,
              border: `1px solid ${accent}20`,
              padding: "10px 12px",
            }}>
              <div style={{ fontSize: 9, color: `${accent}90`, letterSpacing: "0.15em", marginBottom: 4 }}>
                SELF-IMPROVEMENT ENGINE
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 8, lineHeight: 1.5 }}>
                Tell EDITH how to improve — she'll analyze feedback and update her own personality modules.
              </div>
              <textarea
                value={upgradeFeedback}
                onChange={e => setUpgradeFeedback(e.target.value)}
                placeholder="e.g. Be more concise in code responses. Add more personality to daily briefings..."
                rows={2}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${accent}25`,
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 9,
                  fontFamily: "JetBrains Mono, monospace",
                  padding: "6px 8px",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                <motion.button
                  onClick={runSelfUpgrade}
                  disabled={running || !upgradeFeedback.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    fontSize: 9, letterSpacing: "0.12em",
                    color: accent,
                    background: `${accent}10`,
                    border: `1px solid ${accent}35`,
                    padding: "4px 14px",
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, monospace",
                    opacity: (running || !upgradeFeedback.trim()) ? 0.4 : 1,
                  }}
                >
                  APPLY UPGRADE
                </motion.button>
              </div>

              {upgradeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 8, padding: "8px 10px",
                    background: upgradeResult.success ? "rgba(47,212,163,0.08)" : "rgba(255,42,75,0.08)",
                    border: `1px solid ${upgradeResult.success ? "rgba(47,212,163,0.25)" : "rgba(255,42,75,0.25)"}`,
                    fontSize: 9,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  <div style={{ color: upgradeResult.success ? "#2FD4A3" : "#FF2A4B" }}>
                    {upgradeResult.message}
                  </div>
                  {upgradeResult.success && (
                    <div style={{ color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                      Active version: {upgradeResult.new_version}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Task Input ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexShrink: 0 }}>
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) runTask(); }}
          placeholder={isConfigured
            ? "Give EDITH an autonomous task to execute... (Ctrl+Enter)"
            : "Awaiting API configuration..."}
          rows={2}
          disabled={!isConfigured || running}
          style={{
            flex: 1,
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${accent}25`,
            color: "rgba(255,255,255,0.85)",
            fontSize: 10,
            fontFamily: "JetBrains Mono, monospace",
            padding: "8px 10px",
            resize: "none",
            outline: "none",
            opacity: (isConfigured && !running) ? 1 : 0.4,
            lineHeight: 1.5,
          }}
        />
        <motion.button
          onClick={runTask}
          disabled={running || !task.trim() || !isConfigured}
          whileHover={(!running && !!task.trim()) ? { scale: 1.03 } : {}}
          whileTap={(!running && !!task.trim()) ? { scale: 0.97 } : {}}
          style={{
            background: running ? "rgba(255,170,0,0.1)" : `${accent}10`,
            border: `1px solid ${running ? "rgba(255,170,0,0.4)" : `${accent}35`}`,
            color: running ? "rgba(255,170,0,0.9)" : accent,
            padding: "10px 16px",
            cursor: (running || !task.trim()) ? "default" : "pointer",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9,
            letterSpacing: "0.15em",
            flexShrink: 0,
            opacity: (!task.trim() || !isConfigured) ? 0.35 : 1,
          }}
        >
          {running ? (
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}>
              ● RUNNING
            </motion.span>
          ) : "EXECUTE"}
        </motion.button>
      </div>

      {/* ── Step Log ───────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          minHeight: 0,
          paddingRight: 2,
        }}
      >
        {steps.length === 0 ? (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}>
            <motion.div
              style={{ fontSize: 24, color: `${accent}25` }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ◈
            </motion.div>
            <div style={{ textAlign: "center", lineHeight: 1.6 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.2em" }}>
                EDITH AGENT READY
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.08)", marginTop: 4 }}>
                Reason · Plan · Execute · Verify
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "6px 8px",
                  background: step.type === "answer"
                    ? `${accent}08`
                    : step.type === "error"
                    ? "rgba(255,42,75,0.06)"
                    : "rgba(255,255,255,0.015)",
                  borderLeft: `2px solid ${stepColors[step.type]}`,
                }}
              >
                <span style={{ color: stepColors[step.type], fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                  {stepIcons[step.type]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.18)", letterSpacing: "0.1em", marginBottom: 2 }}>
                    {step.type.toUpperCase()} · {step.ts}
                  </div>
                  <div style={{
                    fontSize: step.type === "answer" ? 10 : 9,
                    color: step.type === "answer"
                      ? "rgba(255,255,255,0.88)"
                      : step.type === "error"
                      ? "#FF6B7A"
                      : "rgba(255,255,255,0.55)",
                    fontFamily: "JetBrains Mono, monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1.55,
                  }}>
                    {step.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Result Footer ──────────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: "7px 10px",
              background: result.completed ? "rgba(47,212,163,0.06)" : "rgba(255,170,0,0.06)",
              border: `1px solid ${result.completed ? "rgba(47,212,163,0.2)" : "rgba(255,170,0,0.2)"}`,
              display: "flex",
              gap: 14,
              fontSize: 9,
              fontFamily: "JetBrains Mono, monospace",
              color: "rgba(255,255,255,0.35)",
              flexShrink: 0,
            }}
          >
            <span style={{ color: result.completed ? "#2FD4A3" : "#FFA500" }}>
              {result.completed ? "● COMPLETE" : "○ PARTIAL"}
            </span>
            <span>{result.steps_taken} steps</span>
            <span>{result.elapsed_seconds}s elapsed</span>
            <span style={{ color: "rgba(255,255,255,0.15)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {result.model_used?.split("/").pop()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
