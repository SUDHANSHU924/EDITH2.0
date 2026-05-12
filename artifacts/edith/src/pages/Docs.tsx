import { DocsLayout } from "@/components/DocsLayout";
import { SiteLayout } from "@/components/SiteLayout";

const SECTIONS = [
  "Getting Started",
  "Installation",
  "Voice Commands",
  "System Modules",
  "Configuration",
  "API Reference",
  "FAQ",
];

const VOICE_COMMANDS = [
  { command: "Open [app]", description: "Opens any application" },
  { command: "Search [query]", description: "Web search" },
  { command: "Create file [name]", description: "Creates a file" },
  { command: "Take screenshot", description: "Captures screen" },
  { command: "Summarize this", description: "Summarizes the current context" },
  { command: "Run [script]", description: "Executes a local script" },
];

export default function DocsPage() {
  return (
    <SiteLayout>
      <DocsLayout sections={SECTIONS} activeSection="Getting Started">
        <div style={{ fontFamily: "Inter, sans-serif" }}>
          <h1 style={{ fontSize: 26, margin: "0 0 16px" }}>Installing EDITH</h1>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>Step 1: Download</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            Download the installer for your OS from the download page.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>Step 2: Run Installer</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            Double click the .dmg or .exe file and follow the on-screen instructions.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>Step 3: Grant Permissions</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            EDITH needs microphone and accessibility access to control your system.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24 }}>Step 4: First Launch</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            EDITH will greet you: "EDITH online. Commander recognized. How can I serve you today?"
          </p>

          <h2 style={{ fontSize: 18, marginTop: 32 }}>Voice Commands</h2>
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                  <th style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)" }}>Command</th>
                  <th style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {VOICE_COMMANDS.map((item) => (
                  <tr key={item.command} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: "10px 8px", fontFamily: "JetBrains Mono, monospace", color: "#00F0FF" }}>{item.command}</td>
                    <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.55)" }}>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DocsLayout>
    </SiteLayout>
  );
}
