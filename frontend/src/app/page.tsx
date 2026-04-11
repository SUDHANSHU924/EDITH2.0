import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#05090f] to-black opacity-80" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-5xl">
          <div className="glass glow-cyan border border-cyan/30 p-10 md:p-16">
            <div className="flex items-center gap-3 text-cyan">
              <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-cyan" />
              <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-cyan/80">
                Tactical Command Interface
              </p>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-white">
                  E.D.I.T.H
                  <span className="block text-cyan">Autonomous Intelligence</span>
                </h1>
                <p className="text-sm md:text-base text-white/60 max-w-xl">
                  World-class operational HUD for multi-system orchestration, realtime
                  analysis, and mission-grade autonomy. All systems in standby.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="border border-cyan/40 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-cyan/80">
                    Systems: 15
                  </span>
                  <span className="border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/50">
                    Mode: Commander
                  </span>
                </div>
              </div>
              <div className="space-y-5">
                <div className="glass p-5">
                  <p className="font-mono text-xs text-cyan/70">STATUS FEED</p>
                  <div className="mt-3 space-y-2 text-xs text-white/60">
                    <p>ORBIT LINK: stable</p>
                    <p>VOICE CHANNEL: standby</p>
                    <p>SECURITY: armed</p>
                    <p>HACKER MODE: locked</p>
                  </div>
                </div>
                <Link
                  href="/commander"
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden border border-cyan/60 px-6 py-4 text-sm font-mono uppercase tracking-[0.4em] text-cyan transition hover:text-black"
                >
                  <span className="absolute inset-0 bg-cyan/90 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative">Initialize System</span>
                </Link>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                  Authorized Commanders Only
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/30">
            <span>EDITH CORE v2.0</span>
            <span>Signal Sync: 100%</span>
          </div>
        </div>
      </div>
    </main>
  );
}
