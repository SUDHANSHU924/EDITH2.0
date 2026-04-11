'use client';

import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: {
    id: string | number;
    content: string;
    role: 'user' | 'assistant';
    timestamp?: string;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    // COMMANDER MESSAGE STYLE
    return (
      <div className="flex items-end gap-3 justify-end max-w-md">
        {/* Avatar badge */}
        <div className="flex flex-col items-end gap-1">
          <div className="px-4 py-3 rounded-lg border border-text-secondary bg-transparent backdrop-blur-0">
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-9px font-mono text-text-tertiary">
              {message.timestamp || new Date().toLocaleTimeString('en-US', { timeStyle: 'medium' })}
            </span>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/30 flex items-center justify-center flex-shrink-0">
              <span className="text-10px font-mono font-bold text-cyan">CMD</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDITH MESSAGE STYLE
  return (
    <motion.div
      className="flex items-start gap-3 max-w-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar badge */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/40 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-10px font-mono font-bold text-cyan">E2.0</span>
      </div>

      {/* Message content with cyan beam */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="cyan-beam">
          <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
        <span className="text-9px font-mono text-text-tertiary">
          {message.timestamp || new Date().toLocaleTimeString('en-US', { timeStyle: 'medium' })}
        </span>
      </div>
    </motion.div>
  );
}
