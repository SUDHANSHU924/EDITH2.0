'use client';

import { motion } from 'framer-motion';

interface SystemPanelProps {
  activeSystem?: string;
  onSystemChange?: (system: string) => void;
}

const systems = [
  { id: '01-convo', name: 'Conversational', color: '#00F0FF' },
  { id: '02-planning', name: 'Planning', color: '#7B61FF' },
  { id: '03-code', name: 'Code Gen', color: '#00D9FF' },
  { id: '04-files', name: 'Files', color: '#00F0FF' },
  { id: '05-search', name: 'Search', color: '#00F0FF' },
];

export function SystemPanel({
  activeSystem = '01-convo',
  onSystemChange,
}: SystemPanelProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-mono font-semibold text-muted-foreground px-2">
        ACTIVE SYSTEM
      </div>

      <div className="space-y-2">
        {systems.map((system) => (
          <motion.button
            key={system.id}
            onClick={() => onSystemChange?.(system.id)}
            className={`
              w-full px-3 py-2 rounded text-xs font-mono text-left
              transition-all duration-200
              ${
                activeSystem === system.id
                  ? 'bg-cyan-500/20 border border-cyan-500/50'
                  : 'hover:bg-muted/50 border border-transparent'
              }
            `}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <span style={{ color: system.color }}>{system.id}</span>
            <div className="text-muted-foreground text-xs">{system.name}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
