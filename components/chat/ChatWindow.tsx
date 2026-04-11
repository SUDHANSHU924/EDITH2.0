'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string | number;
  content: string;
  sender: 'user' | 'ai';
  isThinking?: boolean;
  accentColor?: string;
  timestamp?: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
  accentColor?: string;
}

export function ChatWindow({
  messages,
  isLoading = false,
  accentColor = '#00F0FF',
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
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-background overflow-hidden"
    >
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <motion.div
            className="h-full flex items-center justify-center flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="text-6xl font-mono font-bold"
              style={{
                background: `linear-gradient(135deg, ${accentColor} 0%, #7B61FF 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              A2
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">AURA 2.0 Online</h1>
              <p className="text-muted-foreground max-w-xs">
                All 12 command modules initialized. Ready for directives.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.content}
                sender={message.sender}
                isThinking={message.isThinking}
                accentColor={message.accentColor || accentColor}
                timestamp={message.timestamp}
              />
            ))}

            {isLoading && (
              <MessageBubble
                message="Processing directive..."
                sender="ai"
                isThinking
                accentColor={accentColor}
              />
            )}
          </>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
