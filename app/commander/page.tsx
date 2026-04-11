'use client';

import { useState, useCallback } from 'react';
import { ChatWindow, Message } from '@/components/chat/ChatWindow';

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: `E.D.I.T.H 2.0 — Online.
Commander recognized. Ready for directives.
Capabilities active: Code · Search · Files · Analysis · Security · Automation

All 12 command modules initialized. Select a module from The ORBIT or issue a directive.

How can I serve you today?`,
    timestamp: '11:33:52',
  },
  {
    id: 2,
    role: 'user',
    content: 'Run a full system diagnostic and show me the status of all 15 modules.',
    timestamp: '11:34:15',
  },
  {
    id: 3,
    role: 'assistant',
    content: `Initiating full diagnostic sweep across all 15 command modules...

Modules 01-13: ✓ NOMINAL
Module 14 (Hacker Mode): 🔒 LOCKED — Awaiting authorization
Module 15 (Satellite): 🔒 LOCKED — Clearance required

All primary systems operational. DeepSeek R1 latency: 312ms. Context window: 87% available.`,
    timestamp: '11:34:18',
  },
];

export default function CommanderPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback((message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      // Add thinking indicator
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 0.5,
          role: 'assistant',
          content: '',
          isThinking: true,
          thinking: 'FORGING REASONING CHAIN...',
        },
      ]);
    }, 200);

    // Simulate response
    setTimeout(() => {
      // Remove thinking indicator and add response
      setMessages((prev) => {
        const withoutThinking = prev.filter((m) => !m.isThinking);
        return [
          ...withoutThinking,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: `Processing your directive: "${message}"\n\nSystem 01: Conversational Intelligence engaged.\nContext window updated. Confidence: 99.4%`,
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }),
          },
        ];
      });
      setIsLoading(false);
    }, 2500);
  }, []);

  return (
    <ChatWindow
      messages={messages}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
    />
  );
}
