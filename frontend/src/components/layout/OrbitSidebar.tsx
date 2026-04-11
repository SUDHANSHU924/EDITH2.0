"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SYSTEMS } from "@/lib/mockData";
import StatusDot from "@/components/ui/StatusDot";
import { useSystemStore } from "@/store/systemStore";

export default function OrbitSidebar() {
  const activeSystem = useSystemStore((state) => state.activeSystem);
  const sidebarExpanded = useSystemStore((state) => state.sidebarExpanded);
  const setActiveSystem = useSystemStore((state) => state.setActiveSystem);
  const toggleSidebar = useSystemStore((state) => state.toggleSidebar);

  return (
    <aside
      className={clsx(
        "glass flex h-full flex-col border-r border-cyan/20 transition-all duration-200",
        sidebarExpanded ? "w-72" : "w-16"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60"
        >
          <span className="font-mono text-cyan">ORBIT</span>
          <ChevronRight
            className={clsx(
              "h-4 w-4 transition-transform",
              sidebarExpanded ? "rotate-180" : "rotate-0"
            )}
          />
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {SYSTEMS.map((system) => {
          const isActive = activeSystem === system.id;
          return (
            <Link
              key={system.id}
              href={system.route}
              onClick={() => setActiveSystem(system.id)}
              className={clsx(
                "flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left text-xs uppercase tracking-[0.2em] transition",
                isActive
                  ? "border-cyan/50 bg-cyan/10 text-cyan"
                  : "text-white/50 hover:border-cyan/20 hover:text-white"
              )}
            >
              <StatusDot status={system.status} />
              {sidebarExpanded ? (
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] text-white/40">
                      SYSTEM {String(system.id).padStart(2, "0")}
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {system.name}
                    </div>
                  </div>
                  {system.locked && (
                    <span className="text-[10px] text-danger">LOCKED</span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-white/50">
                  {String(system.id).padStart(2, "0")}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
