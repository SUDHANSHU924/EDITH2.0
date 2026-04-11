'use client';

import { MODULES } from '@/lib/figma-tokens';

interface TopBarProps {
  activeModule?: number;
  onModuleChange?: (moduleNumber: number) => void;
}

export function TopBar({ activeModule = 1, onModuleChange }: TopBarProps) {
  const activeModuleData = MODULES[activeModule - 1];

  return (
    <div className="w-full h-12 glass-panel flex items-center justify-between px-6 border-b border-cyan-glow">
      {/* Left: EDITH branding and status */}
      <div className="flex items-center gap-3">
        <div className="font-mono text-sm font-bold text-cyan">
          EDITH 2.0
        </div>
        <span className="text-10px font-mono text-text-secondary">
          12 MOD ONLINE
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-status-green ml-2"></div>
      </div>

      {/* Center: Breadcrumb / Module name */}
      <div className="flex-1 text-center">
        <div className="font-mono text-xs uppercase text-text-cyan">
          {activeModuleData?.name || 'CORE'}
        </div>
      </div>

      {/* Right: Pills and controls */}
      <div className="flex items-center gap-2">
        {/* Module quick-switch pills */}
        <div className="flex gap-1 px-2 py-1 bg-surface rounded border border-cyan-glow text-9px font-mono text-text-secondary">
          {['CORE', 'AGENT', 'CODE', 'FILES', 'SEARCH'].map((name, idx) => (
            <button
              key={name}
              onClick={() => onModuleChange?.(idx + 1)}
              className={`px-1.5 py-0.5 rounded ${
                idx + 1 === activeModule
                  ? 'bg-cyan text-void'
                  : 'hover:text-text-primary'
              } transition-colors`}
            >
              {name.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* S1 · DIRECTED pill */}
        <button className="px-3 h-7 rounded border border-cyan text-9px font-mono text-cyan hover:bg-cyan/10 transition-all">
          S1 · DIRECTED
        </button>

        {/* OVERRIDE button (red) */}
        <button className="px-3 h-7 rounded border border-red text-9px font-mono text-red hover:bg-red/10 transition-all">
          OVERRIDE
        </button>

        {/* Timestamp */}
        <div className="font-mono text-9px text-text-secondary ml-2">
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
