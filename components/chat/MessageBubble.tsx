'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  isThinking?: boolean;
  accentColor?: string;
  timestamp?: string;
}

export function MessageBubble({
  message,
  sender,
  isThinking = false,
  accentColor = '#00F0FF',
  timestamp,
}: MessageBubbleProps) {
  const [isCodeBlock, setIsCodeBlock] = useState(message.includes('```'));

  const bgColor = sender === 'user' ? 'bg-cyan-500/10' : 'bg-blue-500/5';
  const borderColor = sender === 'user' ? 'border-cyan-500/30' : 'border-muted';
  const textColor = sender === 'user' ? 'text-foreground' : 'text-foreground';

  return (
    <motion.div
      className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`
          max-w-[70%] px-4 py-3 rounded-lg
          border backdrop-blur-sm
          ${bgColor} ${borderColor} ${textColor}
          ${isThinking ? 'animate-pulse' : ''}
        `}
        style={{
          borderLeftColor: sender === 'user' ? undefined : accentColor,
          borderLeftWidth: sender === 'user' ? 0 : 3,
        }}
      >
        {/* Sender label */}
        {sender === 'ai' && (
          <div className="text-xs font-mono font-semibold mb-2" style={{ color: accentColor }}>
            E.D.I.T.H
          </div>
        )}

        {/* Message content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-sans">
          {isThinking ? (
            <span className="inline-flex items-center gap-1">
              <span>Processing</span>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ●
              </motion.span>
            </span>
          ) : (
            message
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs text-muted-foreground mt-2 font-mono">
            {timestamp}
          </div>
        )}
      </div>
    </motion.div>
  );
}
