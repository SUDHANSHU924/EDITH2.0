import { Activity, Shield, Cpu } from "lucide-react";
import CyanBadge from "@/components/ui/CyanBadge";
import StatusDot from "@/components/ui/StatusDot";

export default function TopBar() {
  return (
    <header className="glass flex h-12 items-center justify-between border-b border-cyan/20 px-6">
      <div className="flex items-center gap-3">
        <StatusDot status="online" className="animate-pulse-cyan" />
        <span className="font-mono text-xs tracking-[0.4em] text-cyan">
          EDITH
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
          Commander
        </span>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <CyanBadge>CORE</CyanBadge>
        <CyanBadge>ORBIT</CyanBadge>
        <CyanBadge>PERIPHERY</CyanBadge>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 text-white/60 md:flex">
          <Activity className="h-4 w-4" />
          <Shield className="h-4 w-4" />
          <Cpu className="h-4 w-4" />
        </div>
        <button className="border border-danger/60 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.3em] text-danger hover:bg-danger/20">
          Override
        </button>
      </div>
    </header>
  );
}
