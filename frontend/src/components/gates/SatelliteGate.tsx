import Link from "next/link";
import StatusDot from "@/components/ui/StatusDot";

export default function SatelliteGate() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="glass border border-violet/50 p-8 max-w-xl shadow-[0_0_24px_rgba(123,97,255,0.25)]">
        <div className="flex items-center gap-3 text-violet">
          <StatusDot status="locked" />
          <p className="font-mono text-xs uppercase tracking-[0.4em]">
            Orbital Access
          </p>
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-white">
          Satellite Intel Locked
        </h1>
        <p className="mt-3 text-sm text-white/60">
          System 15 is sealed pending satellite command credentials. Awaiting
          clearance.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/commander"
            className="border border-cyan/40 px-4 py-2 text-xs font-mono uppercase tracking-[0.3em] text-cyan"
          >
            Return to Command
          </Link>
          <button className="border border-violet/50 px-4 py-2 text-xs font-mono uppercase tracking-[0.3em] text-violet">
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
}
