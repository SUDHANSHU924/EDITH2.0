import { motion } from "framer-motion";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  badge: string;
  badgeTone: "cyan" | "red" | "violet";
  features: PricingFeature[];
  ctaLabel: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
  accentColor: string;
}

const badgeColors = {
  cyan: "#00F0FF",
  red: "#FF2A4B",
  violet: "#7B61FF",
};

export function PricingCard({
  title,
  price,
  badge,
  badgeTone,
  features,
  ctaLabel,
  onCtaClick,
  ctaDisabled = false,
  accentColor,
}: PricingCardProps) {
  const badgeColor = badgeColors[badgeTone];

  return (
    <motion.div
      style={{
        borderRadius: 20,
        padding: 24,
        background: "rgba(8,12,22,0.92)",
        border: `1px solid ${accentColor}30`,
        boxShadow: "0 16px 34px rgba(0,0,0,0.45)",
        position: "relative",
      }}
      whileHover={{ y: -4, boxShadow: "0 20px 42px rgba(0,0,0,0.55)" }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.16em", color: accentColor }}>
          {title}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9,
            letterSpacing: "0.18em",
            color: badgeColor,
            border: `1px solid ${badgeColor}55`,
            padding: "4px 8px",
            borderRadius: 999,
            background: `${badgeColor}12`,
          }}
        >
          {badge}
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 28, fontWeight: 600 }}>
        {price}
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {features.map((feature) => (
          <div key={feature.text} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ color: feature.included ? "#2FD4A3" : "rgba(255,255,255,0.35)", fontSize: 14 }}>
              {feature.included ? "✓" : "✗"}
            </span>
            <span style={{ color: feature.included ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6 }}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onCtaClick}
        disabled={ctaDisabled}
        style={{
          marginTop: 22,
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: `1px solid ${accentColor}`,
          background: ctaDisabled ? "rgba(255,255,255,0.04)" : `${accentColor}12`,
          color: ctaDisabled ? "rgba(255,255,255,0.4)" : accentColor,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          letterSpacing: "0.16em",
          cursor: ctaDisabled ? "not-allowed" : "pointer",
        }}
      >
        {ctaLabel}
      </button>
    </motion.div>
  );
}
