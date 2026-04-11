'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-edith-darker flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, 0.05) 25%, rgba(0, 240, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.05) 75%, rgba(0, 240, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, 0.05) 25%, rgba(0, 240, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.05) 75%, rgba(0, 240, 255, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div
          className="mb-8 inline-flex"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-600/20 border border-cyan-500/40"
            style={{
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            }}
          >
            <span className="font-mono text-4xl font-bold text-cyan-400">A2</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            AURA 2.0
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-2 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Advanced Universal Reasoning Architecture
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground mb-12 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          v2.0 — 12 Command Modules · Autonomous Planning · Conversational AI
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {[
            { title: '12 Modules', desc: 'Command modules for every task' },
            { title: 'Autonomous', desc: 'Self-learning & adaptive reasoning' },
            { title: '24/7 Online', desc: 'Always available and responsive' },
          ].map((feature, i) => (
            <div
              key={i}
              className="px-6 py-4 rounded-lg border transition-colors hover:background-white/5"
              style={{
                borderColor: 'rgba(0, 240, 255, 0.2)',
                backgroundColor: 'rgba(0, 240, 255, 0.05)',
              }}
            >
              <h3 className="font-semibold text-cyan-400 mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            href="/commander"
            className="px-8 py-3 rounded-lg font-semibold text-background transition-all duration-200 hover:shadow-lg"
            style={{
              background: 'linear-gradient(90deg, #00F0FF, #7B61FF)',
              boxShadow: '0 0 20px rgba(0,240,255,0.3)',
            }}
          >
            Launch Commander
          </Link>

          <button
            className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-white/5"
            style={{
              border: '1px solid rgba(0, 240, 255, 0.4)',
              color: '#00F0FF',
            }}
          >
            Learn More
          </button>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-10 right-10 w-32 h-32 rounded-full border border-cyan-500/20"
        animate={{
          rotate: 360,
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="absolute bottom-10 left-10 w-40 h-40 rounded-full border border-blue-500/20"
        animate={{
          rotate: -360,
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
