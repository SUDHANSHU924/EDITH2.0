import { type ReactNode } from "react";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { HudStatusBar } from "@/components/HudStatusBar";
import { Footer } from "@/components/Footer";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Download", href: "/download" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

interface SiteLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function SiteLayout({ children, showFooter = true }: SiteLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "white", position: "relative" }}>
      <BackgroundGrid />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 15%, rgba(0,240,255,0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgba(123,97,255,0.14), transparent 40%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <HudStatusBar
          variant="marketing"
          securityMode={false}
          activeDepartment="core"
          autonomyStage={1}
          accentColor="#00F0FF"
          navItems={NAV_ITEMS}
          ctaLabel="Download Now"
          ctaHref="/download"
        />
        <main style={{ flex: 1 }}>{children}</main>
        {showFooter ? <Footer /> : null}
      </div>
    </div>
  );
}
