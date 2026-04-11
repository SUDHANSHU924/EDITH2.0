import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Attachment, Message } from "@/types/message.types";

interface ChatStore {
  messages: Message[];
  isThinking: boolean;
  addMessage: (msg: Omit<Message, "id"> & { id?: number }) => number;
  updateMessage: (id: number, partial: Partial<Message>) => void;
  appendToMessage: (id: number, delta: string) => void;
  setThinking: (v: boolean) => void;
  clearMessages: () => void;
}

const createId = () => Date.now() + Math.floor(Math.random() * 1000);

const sanitizeAttachments = (attachments?: Attachment[]) =>
  attachments?.map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
    source: attachment.source,
  }));

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isThinking: false,
      addMessage: (msg) => {
        const id = msg.id ?? createId();
        set((state) => ({
          messages: [...state.messages, { ...msg, id }],
        }));
        return id;
      },
      updateMessage: (id, partial) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...partial } : m
          ),
        })),
      appendToMessage: (id, delta) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, content: m.content + delta } : m
          ),
        })),
      setThinking: (v) => set({ isThinking: v }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "edith-chat-store",
      partialize: (state) => ({
        messages: state.messages.map((message) =>
          message.attachments
            ? {
                ...message,
                attachments: sanitizeAttachments(message.attachments),
              }
            : message
        ),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.isThinking = false;
        state.messages = state.messages.map((message) => ({
          ...message,
          isStreaming: false,
        }));
      },
    }
  )
);
