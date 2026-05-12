import { motion } from "framer-motion";
import { Mic, Monitor } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { SiteLayout } from "@/components/SiteLayout";
import { DEPARTMENTS, type DepartmentId } from "@/departments";

const FEATURE_DETAILS: Record<DepartmentId, string> = {
  core: "Conversational nucleus with memory, reasoning, and commander context.",
  planning: "Agentic planning engine that decomposes goals into actions.",
  code: "Code engineering suite for building, debugging, and shipping.",
  files: "Document intelligence for writing, editing, and file control.",
  search: "Live intelligence layer for research, sources, and synthesis.",
  learning: "Self-learning module that adapts to your workflows.",
  ml: "Data lab for training, evaluation, and model experimentation.",
  iot: "IoT control plane for smart devices and ambient automation.",
  vision: "Vision lens for images, diagrams, and multimodal insight.",
  voice: "Voice interface stack with multilingual understanding.",
  personal: "Personalization engine for tone, memory, and preferences.",
  security: "Ethical hacker mode with defensive security workflows.",
  daily: "Daily ops module for schedules, routines, and reminders.",
  security_grid: "Restricted offensive testing with strict safety controls.",
  satellite: "Satellite intelligence for telemetry and orbital data.",
};

const RESTRICTED_MODULES = new Set<DepartmentId>(["security", "security_grid", "satellite"]);

const voiceIcon = (
  <div style={{ position: "relative", width: 28, height: 28 }}>
    <Mic size={20} style={{ color: "#00F0FF" }} />
    <motion.div
      style={{
        position: "absolute",
        left: -2,
        right: -2,
        bottom: -6,
        height: 4,
        borderRadius: 999,
        background: "linear-gradient(90deg, rgba(0,240,255,0.2), rgba(0,240,255,0.9), rgba(0,240,255,0.2))",
      }}
      animate={{ opacity: [0.3, 0.9, 0.3], scaleX: [0.6, 1, 0.6] }}
      transition={{ duration: 1.4, repeat: Infinity }}
    />
  </div>
);

const osIcon = (
  <div style={{ position: "relative", width: 28, height: 28 }}>
    <Monitor size={20} style={{ color: "#7B61FF" }} />
    <motion.div
      style={{
        position: "absolute",
        left: 2,
        right: 2,
        bottom: -4,
        height: 3,
        borderRadius: 999,
        background: "linear-gradient(90deg, rgba(123,97,255,0.2), rgba(123,97,255,0.9), rgba(123,97,255,0.2))",
      }}
      animate={{ opacity: [0.3, 0.8, 0.3], scaleX: [0.7, 1, 0.7] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    />
  </div>
);

const alwaysOnIcon = (
  <motion.div
    style={{
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(47,212,163,1) 0%, rgba(47,212,163,0.1) 70%)",
      boxShadow: "0 0 18px rgba(47,212,163,0.7)",
    }}
    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 1.6, repeat: Infinity }}
  />
);

export default function FeaturesPage() {
  const featuredCards = [
    {
      title: "Voice Control",
      description: "Talk naturally in any language. EDITH understands Hindi, English, Hinglish, and 50+ more.",
      accentColor: "#00F0FF",
      status: "ACTIVE" as const,
      module: "F01",
      iconNode: voiceIcon,
    },
    {
      title: "OS Control",
      description: "Controls your entire computer. Opens apps, manages files, browses web, writes and runs code.",
      accentColor: "#7B61FF",
      status: "ACTIVE" as const,
      module: "F02",
      iconNode: osIcon,
    },
    {
      title: "Always On",
      description: "Never sleeps. Always listening. Runs silently in the background 24/7 like a real AI assistant.",
      accentColor: "#2FD4A3",
      status: "ACTIVE" as const,
      module: "F03",
      iconNode: alwaysOnIcon,
    },
  ];

  return (
    <SiteLayout>
      <section style={{ padding: "96px 0 60px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.3em", color: "rgba(0,240,255,0.7)" }}>
              FEATURED SYSTEMS
            </div>
            <h1 style={{ margin: "12px 0 10px", fontSize: 32 }}>15 Specialized Intelligence Modules</h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", maxWidth: 640, lineHeight: 1.7 }}>
              EDITH ships with a full fleet of autonomous systems, each designed for mission-specific intelligence.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredCards.map((card) => (
              <FeatureCard key={card.title} {...card} featured />
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 120 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)" }}>
              FULL MODULE GRID
            </div>
            <h2 style={{ margin: "12px 0 0", fontSize: 26 }}>All 15 Systems Online</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DEPARTMENTS.map((dept) => (
              <FeatureCard
                key={dept.id}
                title={dept.label}
                description={FEATURE_DETAILS[dept.id]}
                module={dept.moduleNum}
                status={RESTRICTED_MODULES.has(dept.id) ? "RESTRICTED" : "ACTIVE"}
                accentColor={dept.color}
                icon={dept.icon}
              />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
