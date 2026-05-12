import { type ReactNode } from "react";

interface DocsLayoutProps {
  sections: string[];
  activeSection: string;
  children: ReactNode;
}

export function DocsLayout({ sections, activeSection, children }: DocsLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          style={{
            background: "rgba(8,12,22,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 18,
            height: "fit-content",
            position: "sticky",
            top: 96,
          }}
        >
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
            DOCUMENTATION
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {sections.map((section) => {
              const active = section === activeSection;
              return (
                <div
                  key={section}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: active ? "rgba(0,240,255,0.12)" : "transparent",
                    border: active ? "1px solid rgba(0,240,255,0.35)" : "1px solid transparent",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: active ? "#00F0FF" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {section}
                </div>
              );
            })}
          </div>
        </aside>
        <div
          style={{
            background: "rgba(8,12,22,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 28,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
