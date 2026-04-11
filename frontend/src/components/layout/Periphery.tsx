import GlassPanel from "@/components/ui/GlassPanel";
import LogFeed from "@/components/ui/LogFeed";
import CyanBadge from "@/components/ui/CyanBadge";
import { CAPABILITIES, LOGS, STATS } from "@/lib/mockData";
import clsx from "clsx";

export default function Periphery() {
  return (
    <aside className="hidden h-full w-[320px] flex-col gap-4 border-l border-cyan/20 bg-black/40 p-4 lg:flex">
      <GlassPanel className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/70">
          Periphery
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={clsx(
                "rounded-md border border-white/5 bg-black/40 p-3",
                stat.accent === "cyan" && "border-cyan/30",
                stat.accent === "violet" && "border-violet/30",
                stat.accent === "red" && "border-danger/30"
              )}
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {stat.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/70">
          Capabilities
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CAPABILITIES.map((capability) => (
            <CyanBadge key={capability}>{capability}</CyanBadge>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="flex-1 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/70">
          Live Logs
        </p>
        <div className="mt-4">
          <LogFeed logs={LOGS} />
        </div>
      </GlassPanel>
    </aside>
  );
}
