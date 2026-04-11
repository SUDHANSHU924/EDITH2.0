"use client";

import { useCallback } from "react";
import { edithAPI } from "@/lib/api";
import { streamEdithResponse } from "@/hooks/useStream";
import { useChatStore } from "@/store/chatStore";

export function useEdith(sessionId: string = "default") {
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

      const history = useChatStore
        .getState()
        .messages.map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const assistantId = addMessage({
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      });

      setThinking(true);

      try {
        const response = await edithAPI.chat(history, sessionId);
        if (!response.ok) {
          throw new Error("Failed to connect to EDITH");
        }

        await streamEdithResponse(response, {
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
        updateMessage(assistantId, {
          content: "EDITH backend unavailable.",
          isStreaming: false,
        });
        setThinking(false);
      }
    },
    [addMessage, appendToMessage, updateMessage, setThinking, sessionId]
  );

  return { sendMessage, isThinking };
}
