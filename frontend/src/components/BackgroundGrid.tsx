import { motion } from 'motion/react';

export function BackgroundGrid() {
  return (
    <div 
      className="overflow-hidden pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
    >
      {/* Fine dot grid */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.025 }}>
        <defs>
          <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.6" fill="#00F0FF" />
          </pattern>
          <pattern id="hexGrid" width="50" height="43.4" patternUnits="userSpaceOnUse">
            <path
              d="M25 0L50 14.43V28.87L25 43.3L0 28.87V14.43L25 0Z"
              fill="none"
              stroke="#1A3B5C"
              strokeWidth="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>

      {/* Hexagonal grid overlay */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.015 }}>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>

      {/* Floating particles */}
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 4 === 0 ? 2 : 1,
            height: i % 4 === 0 ? 2 : 1,
            background: i % 3 === 0 ? '#00F0FF' : i % 3 === 1 ? '#7B61FF' : '#4F8EF7',
          }}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1440),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 900),
            opacity: 0,
          }}
          animate={{
            x: [
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1440),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1440),
            ],
            y: [
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 900),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 900),
            ],
            opacity: [0, 0.18, 0.06, 0.22, 0],
          }}
          transition={{
            duration: 25 + Math.random() * 30,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 15,
          }}
        />
      ))}

      {/* Ambient radial gradients */}
      <motion.div
        className="absolute left-1/4 top-1/3 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-[500px] h-[500px] rounded-full bg-cyan-400 blur-[100px]" />
      </motion.div>

      <motion.div
        className="absolute right-1/4 bottom-1/3 translate-x-1/2 translate-y-1/2"
        animate={{ scale: [1, 1.4, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <div className="w-[400px] h-[400px] rounded-full bg-violet-500 blur-[120px]" />
      </motion.div>

      {/* Scan lines — subtle */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.008) 3px, rgba(0,240,255,0.008) 4px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
