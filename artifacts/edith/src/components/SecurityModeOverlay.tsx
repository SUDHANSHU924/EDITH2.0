import { motion } from 'motion/react';
import { useEffect } from 'react';

interface SecurityModeOverlayProps {
  onComplete: () => void;
}

export function SecurityModeOverlay({ onComplete }: SecurityModeOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="flex items-center justify-center pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50"
        animate={{
          x: [0, -2, 2, -2, 2, 0],
          y: [0, 2, -2, 2, -2, 0],
        }}
        transition={{ duration: 0.5 }}
      />

      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
        style={{
          boxShadow: '0 0 20px #FF2A4B, 0 0 40px #FF2A4B',
        }}
        initial={{ top: 0 }}
        animate={{ top: '100%' }}
        transition={{ duration: 1.5, ease: 'linear' }}
      />

      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <motion.path
            d="M60 10 L100 35 L100 85 L60 110 L20 85 L20 35 Z"
            fill="none"
            stroke="#FF2A4B"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M60 10 L100 35 L100 85 L60 110 L20 85 L20 35 Z"
            fill="#FF2A4B"
            fillOpacity="0.1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
          />
          <motion.path
            d="M60 30 L80 45 L80 75 L60 90 L40 75 L40 45 Z"
            fill="none"
            stroke="#FF2A4B"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          />
        </svg>

        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, #FF2A4B 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div
          className="text-red-500 text-xl tracking-widest mb-2"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          SECURITY GRID
        </div>
        <motion.div
          className="text-red-400 text-sm"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ENGAGING...
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
