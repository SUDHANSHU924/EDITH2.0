import { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import { SiteLayout } from "@/components/SiteLayout";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function PricingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <SiteLayout>
      <section style={{ padding: "96px 0 120px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.3em", color: "rgba(0,240,255,0.7)" }}>
              PRICING / PLANS
            </div>
            <h1 style={{ margin: "12px 0 8px", fontSize: 32 }}>Choose your command tier</h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              Start free and upgrade when you need deeper autonomy and premium intelligence.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <PricingCard
              title="FREE BETA"
              price="₹0 / $0"
              badge="AVAILABLE NOW"
              badgeTone="cyan"
              accentColor="#00F0FF"
              ctaLabel="DOWNLOAD FREE"
              onCtaClick={() => setWaitlistOpen(true)}
              features={[
                { text: "Core voice commands", included: true },
                { text: "App launcher", included: true },
                { text: "Web search", included: true },
                { text: "Basic file management", included: true },
                { text: "13 standard systems", included: true },
                { text: "Hacker Mode", included: false },
                { text: "Satellite Intel", included: false },
                { text: "Priority support", included: false },
              ]}
            />
            <PricingCard
              title="COMMANDER"
              price="₹999/month or $12/month"
              badge="MOST POPULAR"
              badgeTone="cyan"
              accentColor="#7B61FF"
              ctaLabel="COMING SOON"
              ctaDisabled
              features={[
                { text: "Everything in Free", included: true },
                { text: "Ethical Hacker Mode", included: true },
                { text: "Advanced OS control", included: true },
                { text: "Priority AI models", included: true },
                { text: "Memory & learning", included: true },
                { text: "Email support", included: true },
              ]}
            />
            <PricingCard
              title="CLASSIFIED"
              price="₹4999/month or $60/month"
              badge="ENTERPRISE"
              badgeTone="red"
              accentColor="#FF2A4B"
              ctaLabel="CONTACT US"
              features={[
                { text: "Everything in Commander", included: true },
                { text: "Satellite Intelligence", included: true },
                { text: "Custom model training", included: true },
                { text: "Dedicated support", included: true },
                { text: "Team access", included: true },
                { text: "API access", included: true },
              ]}
            />
          </div>
        </div>
      </section>
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </SiteLayout>
  );
}
