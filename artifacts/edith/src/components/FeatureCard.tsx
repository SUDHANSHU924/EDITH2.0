import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  module?: string;
  status: "ACTIVE" | "RESTRICTED";
  accentColor: string;
  icon?: LucideIcon;
  iconNode?: ReactNode;
  featured?: boolean;
}

export function FeatureCard({
  title,
  description,
  module,
  status,
  accentColor,
  icon,
  iconNode,
  featured = false,
}: FeatureCardProps) {
  const statusColor = status === "ACTIVE" ? "#2FD4A3" : "#FF2A4B";
  const Icon = icon;

  return (
    <motion.div
      style={{
        borderRadius: 18,
        padding: featured ? 22 : 16,
        background: "rgba(8,12,22,0.9)",
        border: `1px solid ${accentColor}22`,
        boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{ y: -4, boxShadow: `0 18px 36px rgba(0,0,0,0.45)` }}
      transition={{ duration: 0.2 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at top left, ${accentColor}12, transparent 55%)`,
          opacity: featured ? 0.8 : 0.5,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: accentColor,
              letterSpacing: "0.14em",
            }}
          >
            {module ?? ""}
          </span>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: statusColor,
              border: `1px solid ${statusColor}55`,
              padding: "2px 8px",
              borderRadius: 999,
              background: `${statusColor}12`,
            }}
          >
            {status}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <div
            style={{
              width: featured ? 48 : 40,
              height: featured ? 48 : 40,
              borderRadius: 14,
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {iconNode ?? (Icon ? <Icon size={featured ? 22 : 18} style={{ color: accentColor }} /> : null)}
          </div>
          <div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: featured ? 13 : 11,
                color: "white",
                letterSpacing: "0.08em",
              }}
            >
              {title}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {featured ? "SPECIALIZED MODULE" : "SYSTEM MODULE"}
            </div>
          </div>
        </div>

        <p
          style={{
            marginTop: 12,
            fontFamily: "Inter, sans-serif",
            fontSize: featured ? 14 : 12,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}
