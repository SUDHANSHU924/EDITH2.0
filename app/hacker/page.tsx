'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function HackerPage() {
  const [token, setToken] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if (token.toUpperCase() === 'ALPHA') {
      // Would navigate to actual hacker mode
      setIsError(false);
    } else {
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-void edith-grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated red scanline overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(0deg, transparent 24%, rgba(255,42,75,0.03) 25%, rgba(255,42,75,0.03) 26%, transparent 27%, transparent 74%, rgba(255,42,75,0.03) 75%, rgba(255,42,75,0.03) 76%, transparent 77%, transparent)',
          backgroundSize: '100% 4px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '0px 4px'],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Center panel */}
      <motion.div
        className={`w-full max-w-md p-8 rounded-xl border-2 glass-panel ${
          isError ? 'alert-red' : 'border-red'
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
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <AlertTriangle size={48} className="text-red mx-auto" />
          </motion.div>

          <h1 className="text-2xl font-mono font-bold text-red mb-2">
            ⚠ RESTRICTED ACCESS
          </h1>
          <p className="text-sm text-text-secondary font-mono">
            Ethical Hacker Mode — Authorized Personnel Only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-text-tertiary uppercase mb-2">
              Authentication Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setIsError(false);
              }}
              placeholder="Enter clearance code"
              className={`w-full px-4 py-2 rounded-lg border font-mono text-sm bg-void transition-all ${
                isError
                  ? 'border-red text-red placeholder-red/40 focus:border-red focus:ring-1 focus:ring-red'
                  : 'border-red/40 text-white placeholder-text-tertiary focus:border-red focus:ring-1 focus:ring-red'
              }`}
              autoComplete="off"
            />
            {isError && (
              <motion.p
                className="text-xs text-red mt-2 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ✗ Invalid token. Access denied.
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg border border-red bg-transparent text-red font-mono font-bold uppercase hover:bg-red/10 hover:shadow-lg transition-all duration-200 red-glow"
          >
            Authenticate
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-red/20 text-center">
          <p className="text-8px font-mono text-red/60">
            TIER 14 — ETHICAL SECURITY OPERATIONS
          </p>
          <p className="text-8px font-mono text-red/40 mt-1">
            Unauthorized access attempts will be logged.
          </p>
        </div>
      </motion.div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,42,75,0.1), transparent 70%)',
          }}
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </div>
    </div>
  );
}
