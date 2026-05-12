import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          style={{ background: "rgba(2,4,8,0.8)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            style={{
              width: "min(520px, 100%)",
              background: "rgba(8,12,22,0.98)",
              border: "1px solid rgba(0,240,255,0.2)",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.2em", color: "#00F0FF" }}>
                WAITLIST ACCESS
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            </div>
            <h3 style={{ margin: "6px 0 8px", fontSize: 20, fontWeight: 600 }}>EDITH Beta launching soon.</h3>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Join the waitlist to get early access the moment the daemon ships.
            </p>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "grid", gap: 12 }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="commander@edith.ai"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.03)",
                    color: "white",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,240,255,0.6)",
                    background: "rgba(0,240,255,0.12)",
                    color: "#00F0FF",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    cursor: "pointer",
                  }}
                >
                  JOIN WAITLIST
                </button>
              </form>
            ) : (
              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid rgba(0,240,255,0.4)",
                  background: "rgba(0,240,255,0.08)",
                  color: "#00F0FF",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                }}
              >
                CONFIRMED. YOU ARE ON THE LIST.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
