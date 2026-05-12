import { useState } from "react";
import { DemoWindow } from "@/components/DemoWindow";
import { HeroSection } from "@/components/HeroSection";
import { SiteLayout } from "@/components/SiteLayout";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <SiteLayout>
      <HeroSection onDownloadMac={() => setWaitlistOpen(true)} onDownloadWindows={() => setWaitlistOpen(true)} />
      <section style={{ paddingBottom: 120 }}>
        <div className="max-w-5xl mx-auto px-6">
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                letterSpacing: "0.3em",
                color: "rgba(0,240,255,0.7)",
              }}
            >
              DEMO
            </div>
            <h2 style={{ margin: "12px 0 8px", fontSize: 28 }}>EDITH in action</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              Real-time command execution with autonomous follow-through.
            </p>
          </div>
          <DemoWindow />
        </div>
      </section>
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </SiteLayout>
  );
}
