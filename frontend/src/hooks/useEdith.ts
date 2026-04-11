"use client";

import { useCallback } from "react";
import { sendToEDITH } from "@/lib/api";
import { streamEdithResponse } from "@/hooks/useStream";
import { useChatStore } from "@/store/chatStore";

export function useEdith(sessionId: string = "default", department: string = "core") {
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToMessage = useChatStore((state) => state.appendToMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const setThinking = useChatStore((state) => state.setThinking);
  const isThinking = useChatStore((state) => state.isThinking);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const timestamp = new Date().toISOString();
      addMessage({ role: "user", content: trimmed, timestamp });

      const assistantId = addMessage({
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      });

      setThinking(true);

      try {
        const stream = await sendToEDITH(trimmed, department, sessionId);
        
        if (!stream) {
          throw new Error("Failed to connect to EDITH");
        }

        await streamEdithResponse(new Response(stream), {
          onToken: (token) => appendToMessage(assistantId, token),
          onDone: () => {
            updateMessage(assistantId, { isStreaming: false });
            setThinking(false);
          },
          onError: () => {
            updateMessage(assistantId, {
              content: "Signal lost. Re-establish and retry.",
              isStreaming: false,
            });
            setThinking(false);
          },
        });
      } catch (error) {
        console.error("useEdith error:", error);
        updateMessage(assistantId, {
          content: "EDITH backend unavailable.",
          isStreaming: false,
        });
        setThinking(false);
      }
    },
    [addMessage, appendToMessage, updateMessage, setThinking, sessionId, department]
  );

  return { sendMessage, isThinking };
}
