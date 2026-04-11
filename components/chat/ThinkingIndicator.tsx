'use client';

import { motion } from 'framer-motion';

interface ThinkingIndicatorProps {
  thought?: string;
  isVisible?: boolean;
}

export function ThinkingIndicator({
  thought = 'FORGING REASONING CHAIN...',
  isVisible = true,
}: ThinkingIndicatorProps) {
  if (!isVisible && !thought) return null;

  return (
    <motion.div
      className="flex items-start gap-3 max-w-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar badge */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan/20 to-violet/20 border border-violet/40 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-10px font-mono font-bold text-violet">E2.0</span>
      </div>

      {/* Thinking visualization */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Branching tree lines */}
        <div className="h-12 w-4 relative flex items-center justify-center">
          <svg className="w-full h-full absolute" viewBox="0 0 16 48">
            {/* Main vertical line */}
            <motion.line
              x1="8"
              y1="0"
              x2="8"
              y2="48"
              stroke="rgba(0,240,255,0.3)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
            />

            {/* Left branch */}
            <motion.path
              d="M 8 12 Q 4 16 2 20"
              stroke="rgba(123,97,255,0.5)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />

            {/* Right branch */}
            <motion.path
              d="M 8 12 Q 12 16 14 20"
              stroke="rgba(0,240,255,0.5)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />

            {/* Center branch */}
            <motion.circle
              cx="8"
              cy="24"
              r="1.5"
              fill="rgba(0,240,255,0.6)"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </svg>
        </div>

        {/* Thinking text */}
        <div className="text-11px font-mono text-cyan animate-pulse">
          {thought}
        </div>
      </div>
    </motion.div>
  );
}
