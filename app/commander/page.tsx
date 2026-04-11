'use client';

import { useState, useCallback } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { CommanderInput } from '@/components/chat/CommanderInput';
import { StatusBar } from '@/components/chat/StatusBar';

interface Message {
  id: string | number;
  content: string;
  sender: 'user' | 'ai';
  isThinking?: boolean;
  accentColor?: string;
  timestamp?: string;
}

const BOOT_MESSAGE = `E.D.I.T.H — Online.
Commander recognized. Ready for directives.
Capabilities active: Code · Search · Files · Analysis · Security · Automation

All 15 systems initialized. Select a system or issue a directive.

How can I serve you today?`;

export default function CommanderPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'boot',
      content: BOOT_MESSAGE,
      sender: 'ai',
      accentColor: '#00F0FF',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSecurityMode, setIsSecurityMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [contextTurns, setContextTurns] = useState(0);

  const accentColor = isSecurityMode ? '#FF2A4B' : '#00F0FF';

  const handleSendMessage = useCallback(
    async (message: string) => {
      // Check for special commands
      if (message.toLowerCase().includes('/security')) {
        setIsSecurityMode(!isSecurityMode);
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        content: message,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setContextTurns((prev) => prev + 1);

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: `Processing your directive: "${message}"...\n\nSystem 01: Conversational Intelligence engaged.\nContext window: ${contextTurns + 1} turns.\nConfidence: 99.4%`,
          sender: 'ai',
          accentColor,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
    },
    [contextTurns, isSecurityMode, accentColor]
  );

  const handleVoiceStart = () => {
    setIsListening(!isListening);
    // Voice input would be implemented here
  };

  return (
    <>
      {/* Main chat area */}
      <ChatWindow messages={messages} isLoading={isLoading} accentColor={accentColor} />

      {/* Status bar */}
      <StatusBar
        system={isSecurityMode ? 'SECURITY GRID' : 'CORE'}
        contextTurns={contextTurns}
        confidence={99.4}
        isSecurityMode={isSecurityMode}
        accentColor={accentColor}
      />

      {/* Input area */}
      <CommanderInput
        onSend={handleSendMessage}
        onVoiceStart={handleVoiceStart}
        isListening={isListening}
        disabled={isLoading}
      />
    </>
  );
}
