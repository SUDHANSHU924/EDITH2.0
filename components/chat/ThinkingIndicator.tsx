'use client';

import { motion } from 'framer-motion';

interface ThinkingIndicatorProps {
  isVisible?: boolean;
  accentColor?: string;
}

export function ThinkingIndicator({
  isVisible = false,
  accentColor = '#00F0FF',
}: ThinkingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Thinking dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            className="w-2 h-2 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: idx * 0.2,
            }}
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
          />
        ))}
      </div>

      {/* Thinking text */}
      <span className="text-sm font-mono" style={{ color: accentColor }}>
        System is thinking...
      </span>

      {/* CPU indicator */}
      <motion.div
        className="ml-auto w-4 h-4 border border-current rounded"
        animate={{
          borderColor: [accentColor, `${accentColor}80`, accentColor],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          className="w-full h-full"
          animate={{
            scaleX: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          style={{
            backgroundColor: accentColor,
            transformOrigin: 'left',
            opacity: 0.7,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
