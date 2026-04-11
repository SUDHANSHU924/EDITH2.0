"use client";

import { useEffect, useRef } from "react";
import CommanderInput from "@/components/chat/CommanderInput";
import MessageBubble from "@/components/chat/MessageBubble";
import ThinkingIndicator from "@/components/chat/ThinkingIndicator";
import { useChatStore } from "@/store/chatStore";

export default function ChatWindow() {
  const messages = useChatStore((state) => state.messages);
  const isThinking = useChatStore((state) => state.isThinking);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <section className="flex flex-1 flex-col border-x border-cyan/10 bg-black/30">
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {messages.length === 0 && (
          <div className="glass cyan-beam p-6 text-sm text-white/60">
            Awaiting commander input. EDITH systems are in standby.
          </div>
        )}
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isThinking && <ThinkingIndicator />}
          <div ref={endRef} />
        </div>
      </div>
      <CommanderInput />
    </section>
  );
}
