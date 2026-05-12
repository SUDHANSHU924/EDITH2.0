import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface DownloadCardProps {
  platform: string;
  subheading: string;
  detail: string;
  fileSize: string;
  buttonLabel: string;
  onDownload: () => void;
  accentColor: string;
  icon: LucideIcon;
}

export function DownloadCard({
  platform,
  subheading,
  detail,
  fileSize,
  buttonLabel,
  onDownload,
  accentColor,
  icon,
}: DownloadCardProps) {
  const Icon = icon;

  return (
    <motion.div
      style={{
        borderRadius: 20,
        padding: 22,
        background: "rgba(8,12,22,0.9)",
        border: `1px solid ${accentColor}22`,
        boxShadow: "0 16px 36px rgba(0,0,0,0.4)",
      }}
      whileHover={{ y: -4, boxShadow: "0 20px 44px rgba(0,0,0,0.55)" }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${accentColor}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={22} style={{ color: accentColor }} />
        </div>
        <div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: accentColor, letterSpacing: "0.12em" }}>
            {platform}
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{subheading}</div>
        </div>
      </div>

      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
        {detail}
      </div>

      <div
        style={{
          marginTop: 16,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.08em",
        }}
      >
        File size: {fileSize}
      </div>

      <button
        onClick={onDownload}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: `1px solid ${accentColor}`,
          background: `${accentColor}12`,
          color: accentColor,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          letterSpacing: "0.16em",
          cursor: "pointer",
        }}
      >
        {buttonLabel}
      </button>
    </motion.div>
  );
}
