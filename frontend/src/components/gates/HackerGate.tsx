import Link from "next/link";
import StatusDot from "@/components/ui/StatusDot";

export default function HackerGate() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="glass glow-red border border-danger/50 p-8 max-w-xl">
        <div className="flex items-center gap-3 text-danger">
          <StatusDot status="alert" />
          <p className="font-mono text-xs uppercase tracking-[0.4em]">
            Restricted Access
          </p>
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-white">
          Hacker Mode Locked
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Authorization token required. System 14 remains sealed until a verified
          command override is received.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/commander"
            className="border border-cyan/40 px-4 py-2 text-xs font-mono uppercase tracking-[0.3em] text-cyan"
          >
            Return to Command
          </Link>
          <button className="border border-danger/40 px-4 py-2 text-xs font-mono uppercase tracking-[0.3em] text-danger">
            Provide Token
          </button>
        </div>
      </div>
    </div>
  );
}
