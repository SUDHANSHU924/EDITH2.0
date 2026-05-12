import { useState } from "react";
import { Apple, Monitor } from "lucide-react";
import { DownloadCard } from "@/components/DownloadCard";
import { SiteLayout } from "@/components/SiteLayout";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function DownloadPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <SiteLayout>
      <section style={{ padding: "96px 0 60px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.3em", color: "rgba(0,240,255,0.7)" }}>
              DOWNLOAD E.D.I.T.H
            </div>
            <h1 style={{ margin: "12px 0 8px", fontSize: 32 }}>Download E.D.I.T.H</h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              Free Beta · No Account Required
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DownloadCard
              platform="MAC"
              subheading="macOS 13+ · Apple Silicon"
              detail="Optimized for M1, M2, M3, M4, M5"
              fileSize="~2.3 GB"
              buttonLabel="DOWNLOAD FOR MAC .DMG"
              onDownload={() => setWaitlistOpen(true)}
              accentColor="#00F0FF"
              icon={Apple}
            />
            <DownloadCard
              platform="WINDOWS"
              subheading="Windows 10/11 · 64-bit"
              detail="Intel & AMD supported"
              fileSize="~2.1 GB"
              buttonLabel="DOWNLOAD FOR WINDOWS .EXE"
              onDownload={() => setWaitlistOpen(true)}
              accentColor="#7B61FF"
              icon={Monitor}
            />
          </div>

          <div style={{ marginTop: 18, color: "rgba(255,255,255,0.45)", fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
            Linux support coming soon
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 120 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)" }}>
              SYSTEM REQUIREMENTS
            </div>
            <h2 style={{ margin: "12px 0 0", fontSize: 26 }}>Hardware and access needed</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div style={{ borderRadius: 16, padding: 18, background: "rgba(8,12,22,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.12em", color: "#00F0FF" }}>MAC</div>
              <ul style={{ marginTop: 12, paddingLeft: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontSize: 13 }}>
                <li>macOS 13 Ventura or later</li>
                <li>Apple Silicon or Intel</li>
                <li>8GB RAM minimum (16GB recommended)</li>
                <li>10GB free storage</li>
                <li>Microphone access</li>
              </ul>
            </div>
            <div style={{ borderRadius: 16, padding: 18, background: "rgba(8,12,22,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.12em", color: "#7B61FF" }}>WINDOWS</div>
              <ul style={{ marginTop: 12, paddingLeft: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontSize: 13 }}>
                <li>Windows 10/11 64-bit</li>
                <li>8GB RAM minimum</li>
                <li>10GB free storage</li>
                <li>Microphone access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </SiteLayout>
  );
}
