import { Link } from "wouter";

const FOOTER_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Download", href: "/download" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "rgba(4,6,10,0.96)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        marginTop: 64,
      }}
    >
      <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: 36, paddingBottom: 26 }}>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 16,
                color: "#00F0FF",
                letterSpacing: "0.18em",
              }}
            >
              E.D.I.T.H
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
              }}
            >
              WARGO INDUSTRIES
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Autonomous AI agent for real-world computer control.
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 12,
              }}
            >
              LINKS
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 12,
              }}
            >
              STATUS
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              Made with ❤️ for the future.
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
              }}
            >
              Beta access rolling out soon.
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="max-w-6xl mx-auto px-6"
          style={{
            padding: "14px 0",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          © 2025 WARGO INDUSTRIES · All rights reserved · Privacy Policy · Terms of Service
        </div>
      </div>
    </footer>
  );
}
