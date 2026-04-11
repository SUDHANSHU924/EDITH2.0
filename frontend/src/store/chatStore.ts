import { create } from "zustand";
import type { Message } from "@/types/message.types";

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

export const useChatStore = create<ChatStore>((set) => ({
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
}));
