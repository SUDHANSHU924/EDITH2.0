import { motion } from "framer-motion";

interface HeroSectionProps {
  onDownloadMac: () => void;
  onDownloadWindows: () => void;
}

export function HeroSection({ onDownloadMac, onDownloadWindows }: HeroSectionProps) {
  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "120px 24px 80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,240,255,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-5xl mx-auto text-center" style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.4em",
            color: "rgba(0,240,255,0.6)",
            marginBottom: 20,
          }}
        >
          EDITH AI SYSTEM
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            margin: 0,
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          Your Personal
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            margin: "6px 0 0",
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: "#00F0FF",
          }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            animate={{
              textShadow: [
                "0 0 18px rgba(0,240,255,0.2)",
                "0 0 40px rgba(0,240,255,0.6)",
                "0 0 18px rgba(0,240,255,0.2)",
              ],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            Autonomous AI Agent
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginTop: 14, fontSize: 18, color: "rgba(255,255,255,0.7)" }}
        >
          Like Jarvis. But Real.
        </motion.p>

        <div
          style={{
            marginTop: 22,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.8,
          }}
        >
          <span style={{ display: "block" }}>Voice controlled · Always listening ·</span>
          <span style={{ display: "block" }}>Controls your entire computer ·</span>
          <span style={{ display: "block" }}>No cloud required · Runs locally</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4" style={{ marginTop: 28 }}>
          <motion.button
            onClick={onDownloadMac}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,240,255,0.25)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              border: "1px solid #00F0FF",
              color: "#00F0FF",
              background: "transparent",
              padding: "12px 22px",
              borderRadius: 12,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              cursor: "pointer",
            }}
          >
            DOWNLOAD FOR MAC
          </motion.button>
          <motion.button
            onClick={onDownloadWindows}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              border: "1px solid rgba(255,255,255,0.7)",
              color: "white",
              background: "transparent",
              padding: "12px 22px",
              borderRadius: 12,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              cursor: "pointer",
            }}
          >
            DOWNLOAD FOR WINDOWS
          </motion.button>
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.08em",
          }}
        >
          Free during beta · No account needed
        </div>
      </div>
    </section>
  );
}
