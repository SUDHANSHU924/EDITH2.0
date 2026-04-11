'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { CommanderInput } from './CommanderInput';
import { ThinkingIndicator } from './ThinkingIndicator';

export interface Message {
  id: string | number;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  isThinking?: boolean;
  thinking?: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
  onSendMessage?: (message: string) => void;
}

const QUICK_ACTIONS = [
  'Summarize this conversation',
  'Translate to Spanish',
  'Clarify this concept',
];

export function ChatWindow({
  messages,
  isLoading = false,
  onSendMessage,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-void overflow-hidden">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scroll-smooth edith-grid-bg">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              className="h-full flex items-center justify-center flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <div className="text-4xl font-mono text-cyan mb-3 cyan-text-glow">
                  EDITH 2.0
                </div>
                <div className="text-sm text-text-secondary font-mono">
                  Autonomous Intelligence System
                </div>
                <div className="text-xs text-text-tertiary font-mono mt-2">
                  v2.0 // CLASSIFIED
                </div>
              </div>
            </motion.div>
          ) : (
            messages.map((message, idx) => {
              if (message.isThinking) {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ThinkingIndicator
                      thought={message.thinking || 'FORGING REASONING CHAIN...'}
                    />
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <MessageBubble message={message} />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions (if no messages) */}
      {messages.length > 0 && (
        <motion.div
          className="flex-shrink-0 px-6 py-3 flex gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => onSendMessage?.(action)}
              className="px-3 py-1.5 glass-panel text-xs text-text-secondary hover:text-white hover:border-cyan transition-all rounded"
            >
              {action}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 bg-surface border-t border-cyan-glow p-4">
        <CommanderInput
          onSend={onSendMessage || (() => {})}
          disabled={isLoading}
          placeholder="Issue a directive to CORE module..."
        />
      </div>
    </div>
  );
}
