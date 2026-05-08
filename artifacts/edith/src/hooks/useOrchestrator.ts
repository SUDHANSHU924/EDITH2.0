import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import type { Attachment } from "@/types/message.types";
import { executeQuickCommand, parseAndExecute } from "@/lib/actions";

export type TaskEntry = {
  id: number;
  input: string;
  system: string;
  status: "processing" | "complete" | "error";
  timestamp: string;
  response?: string;
};

export type RoutingInfo = {
  system: string;
  reason: string;
  subtask: string;
  priority: "high" | "medium" | "low";
};

export type OrchestratorStatus = {
  active_system: string;
  conversation_turns: number;
  tasks_completed: number;
  task_log: TaskEntry[];
  systems_online: number;
  systems_locked: number;
};

function playBase64Audio(b64: string, fallbackText = "") {
  if (!b64) return false;

  try {
    const bytes = atob(b64);
    const buffer = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) {
      buffer[index] = bytes.charCodeAt(index);
    }

    const audio = new Audio(URL.createObjectURL(new Blob([buffer], { type: "audio/mpeg" })));
    audio.play().catch(() => speakFallback(fallbackText));
    return true;
  } catch {
    return false;
  }
}

function speakFallback(text: string) {
  if (!text || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 0.95;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

export function useOrchestrator(sessionId: string, department: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeSystem, setActiveSystem] = useState("core");
  const [lastRouting, setLastRouting] = useState<RoutingInfo | null>(null);
  const [taskLog, setTaskLog] = useState<TaskEntry[]>([]);
  const [contextTurns, setContextTurns] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  const addMessage = useChatStore((s) => s.addMessage);
  const appendToMessage = useChatStore((s) => s.appendToMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const setThinking = useChatStore((s) => s.setThinking);
  const isThinking = useChatStore((s) => s.isThinking);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/orchestrator/status?session_id=${encodeURIComponent(sessionId)}`);
      if (!res.ok) return;
      const d: OrchestratorStatus = await res.json();
      setActiveSystem(d.active_system);
      setContextTurns(d.conversation_turns);
      setTasksCompleted(d.tasks_completed);
      setTaskLog(d.task_log);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, [sessionId]);

  // Poll status every 6 seconds to confirm backend is alive
  useEffect(() => {
    fetchStatus();
    const iv = setInterval(fetchStatus, 6000);
    return () => clearInterval(iv);
  }, [fetchStatus]);

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[], voiceResponse?: boolean) => {
      if (!content.trim() && !attachments?.length) return;
      if (isThinking) return;

      const trimmed = content.trim();
      if (executeQuickCommand(trimmed)) {
        addMessage(
          { role: "user", content: trimmed, timestamp: new Date().toISOString(), attachments },
          department
        );
        addMessage(
          { role: "assistant", content: "Opening YouTube.", timestamp: new Date().toISOString() },
          department
        );
        fetchStatus();
        return;
      }

      addMessage(
        { role: "user", content: trimmed || "Attached files.", timestamp: new Date().toISOString(), attachments },
        department
      );

      const msgId = addMessage(
        { role: "assistant", content: "", timestamp: new Date().toISOString(), isStreaming: true },
        department
      );
      setThinking(true);

      // Always use HTTP SSE — WebSocket is not supported through the Replit preview proxy
      try {
        const res = await fetch("/api/orchestrator/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
          body: JSON.stringify({
            message: trimmed,
            session_id: sessionId,
            voice_response: voiceResponse ?? false,
          }),
        });

        if (!res.ok || !res.body) throw new Error("stream unavailable");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let hasContent = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const chunk = JSON.parse(line.slice(6));
              if (!chunk.done) {
                if (chunk.token) {
                  hasContent = true;
                  appendToMessage(msgId, chunk.token, department);
                  setActiveSystem(chunk.system ?? activeSystem);
                }
              } else {
                // Final chunk
                if (chunk.routing) setLastRouting(chunk.routing);
                if (chunk.system) setActiveSystem(chunk.system);
                if (chunk.action?.type === "open_url" && chunk.action.url) {
                  window.open(chunk.action.url, "_blank", "noopener,noreferrer");
                }
                if (chunk.full_response) {
                  const rawText = chunk.full_response;
                  const updateData: any = { 
                    content: (executeQuickCommand(rawText) ? rawText : parseAndExecute(rawText)) || rawText,
                    isStreaming: false 
                  };
                  if (chunk.action?.result?.screenshot) {
                    updateData.screenshot_base64 = chunk.action.result.screenshot;
                  }
                  if (chunk.action?.result) {
                    updateData.action = chunk.action;
                  }
                  updateMessage(msgId, updateData, department);
                } else if (!hasContent) {
                  updateMessage(msgId, { content: "No response received. Please try again.", isStreaming: false }, department);
                } else {
                  updateMessage(msgId, { isStreaming: false }, department);
                }

                if (voiceResponse) {
                  const audio = chunk.audio_base64 ?? chunk.audio ?? "";
                  const fallbackText = (chunk.text ?? chunk.full_response ?? "").trim();
                  if (!playBase64Audio(audio, fallbackText)) {
                    speakFallback(fallbackText);
                  }
                }
                setThinking(false);
                fetchStatus();
              }
            } catch {}
          }
        }

        // Stream ended without a done chunk — mark as complete
        updateMessage(msgId, { isStreaming: false }, department);
        setThinking(false);
      } catch (err) {
        console.error("[EDITH] sendMessage error:", err);
        // Fallback: try non-streaming chat endpoint
        try {
          const res = await fetch("/api/orchestrator/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: trimmed,
              session_id: sessionId,
              voice_response: voiceResponse ?? false,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.action?.type === "open_url" && data.action.url) {
              window.open(data.action.url, "_blank", "noopener,noreferrer");
            }
            const rawText = data.reply ?? "";
            const updateData: any = {
              content: (executeQuickCommand(rawText) ? rawText : parseAndExecute(rawText)) || rawText || "No response.",
              isStreaming: false
            };
            if (data.action?.result?.screenshot) {
              updateData.screenshot_base64 = data.action.result.screenshot;
            }
            if (data.action?.result) {
              updateData.action = data.action;
            }
            updateMessage(msgId, updateData, department);
            if (voiceResponse) {
              if (!playBase64Audio(data.audio_base64 ?? data.audio ?? "", rawText)) {
                speakFallback(rawText);
              }
            }
            if (data.routing) setLastRouting(data.routing);
            if (data.system) setActiveSystem(data.system);
          } else {
            updateMessage(msgId, { content: "EDITH orchestrator unavailable.", isStreaming: false }, department);
          }
        } catch {
          updateMessage(msgId, { content: "EDITH orchestrator unavailable.", isStreaming: false }, department);
        }
        setThinking(false);
        fetchStatus();
      }
    },
    [isThinking, department, sessionId, addMessage, appendToMessage, updateMessage, setThinking, fetchStatus]
  );

  const clearHistory = useCallback(async () => {
    try {
      await fetch(`/api/orchestrator/history?session_id=${encodeURIComponent(sessionId)}`, { method: "DELETE" });
      setTaskLog([]);
      setContextTurns(0);
      setTasksCompleted(0);
    } catch {}
  }, [sessionId]);

  return {
    sendMessage,
    clearHistory,
    isThinking,
    wsConnected: isConnected,
    activeSystem,
    lastRouting,
    taskLog,
    contextTurns,
    tasksCompleted,
    fetchStatus,
  };
}
