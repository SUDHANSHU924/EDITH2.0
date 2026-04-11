'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Satellite as SatelliteIcon } from 'lucide-react';

export default function SatellitePage() {
  const [token, setToken] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if (token.toUpperCase() === 'SIGMA') {
      // Would navigate to actual satellite mode
      setIsError(false);
    } else {
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-void edith-grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Orbital animation background */}
      <motion.div className="absolute inset-0 pointer-events-none">
        {/* Outer orbit */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 border border-violet/10 rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle orbit */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 border border-violet/20 rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner orbit */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-32 h-32 border border-violet/30 rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Satellite dot on orbit */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-violet rounded-full"
          animate={{
            rotate: 360,
            x: 'calc(-50% + 128px)',
            y: '-50%',
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Center panel */}
      <motion.div
        className={`w-full max-w-md p-8 rounded-xl border-2 glass-panel relative z-10 ${
          isError ? 'alert-red' : 'border-violet'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block mb-4"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <SatelliteIcon size={48} className="text-violet mx-auto" />
          </motion.div>

          <h1 className="text-2xl font-mono font-bold text-violet mb-2">
            ⬡ SATELLITE INTELLIGENCE
          </h1>
          <p className="text-sm text-text-secondary font-mono">
            Classified Access — High-Level Clearance Required
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-text-tertiary uppercase mb-2">
              Clearance Code
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setIsError(false);
              }}
              placeholder="Enter satellite uplink token"
              className={`w-full px-4 py-2 rounded-lg border font-mono text-sm bg-void transition-all ${
                isError
                  ? 'border-red text-red placeholder-red/40 focus:border-red focus:ring-1 focus:ring-red'
                  : 'border-violet/40 text-white placeholder-text-tertiary focus:border-violet focus:ring-1 focus:ring-violet'
              }`}
              autoComplete="off"
            />
            {isError && (
              <motion.p
                className="text-xs text-red mt-2 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ✗ Uplink failed. Clearance insufficient.
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg border border-violet bg-transparent text-violet font-mono font-bold uppercase hover:bg-violet/10 hover:shadow-lg transition-all duration-200 violet-glow"
          >
            Establish Uplink
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-violet/20 text-center">
          <p className="text-8px font-mono text-violet/60">
            TIER 15 — ORBITAL INTELLIGENCE SYSTEMS
          </p>
          <p className="text-8px font-mono text-violet/40 mt-1">
            All communications encrypted and logged.
          </p>
        </div>
      </motion.div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at center, rgba(123,97,255,0.15), transparent 70%)',
          }}
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
      </div>
    </div>
  );
}
