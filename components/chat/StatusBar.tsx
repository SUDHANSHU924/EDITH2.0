'use client';

import { motion } from 'framer-motion';
import { Activity, Zap, Shield } from 'lucide-react';

interface StatusBarProps {
  system?: string;
  contextTurns?: number;
  confidence?: number;
  isSecurityMode?: boolean;
  accentColor?: string;
}

export function StatusBar({
  system = 'CORE',
  contextTurns = 0,
  confidence = 99.4,
  isSecurityMode = false,
  accentColor = '#00F0FF',
}: StatusBarProps) {
  const finalAccentColor = isSecurityMode ? '#FF2A4B' : accentColor;

  return (
    <motion.div
      className="px-6 py-3 border-t border-border backdrop-blur-sm bg-card/50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between text-xs font-mono">
        {/* System status */}
        <div className="flex items-center gap-4">
          {/* Active system */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              animate={{
                boxShadow: `0 0 8px ${finalAccentColor}`,
                backgroundColor: finalAccentColor,
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span
              style={{
                color: finalAccentColor,
              }}
            >
              {system} · ONLINE
            </span>
          </div>

          {/* Context */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity size={14} />
            <span>CTX: {contextTurns}</span>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap size={14} />
            <span>{confidence.toFixed(1)}%</span>
          </div>
        </div>

        {/* Security mode indicator */}
        {isSecurityMode && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1 rounded border border-red-500/40 bg-red-500/10"
            animate={{
              boxShadow: ['0 0 8px rgba(255, 42, 75, 0.3)', '0 0 16px rgba(255, 42, 75, 0.5)'],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Shield size={14} style={{ color: '#FF2A4B' }} />
            <span style={{ color: '#FF2A4B' }}>SECURITY GRID ACTIVE</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
