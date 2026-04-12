import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Attachment, Message } from "@/types/message.types";

interface ChatStore {
  messages: Record<string, Message[]>;
  isThinking: boolean;
  currentDepartment: string;
  addMessage: (msg: Omit<Message, "id"> & { id?: number }, department?: string) => number;
  updateMessage: (id: number, partial: Partial<Message>, department?: string) => void;
  appendToMessage: (id: number, delta: string, department?: string) => void;
  setThinking: (v: boolean) => void;
  clearMessages: (department?: string) => void;
  setCurrentDepartment: (dept: string) => void;
  getMessages: (department: string) => Message[];
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
    (set, get) => ({
      messages: {},
      isThinking: false,
      currentDepartment: "core",
      setCurrentDepartment: (dept: string) => set({ currentDepartment: dept }),
      addMessage: (msg, department = "core") => {
        const id = msg.id ?? createId();
        set((state) => {
          const deptMessages = state.messages[department] || [];
          return {
            messages: {
              ...state.messages,
              [department]: [...deptMessages, { ...msg, id }],
            },
          };
        });
        return id;
      },
      getMessages: (department: string) => {
        return get().messages[department] || [];
      },
      updateMessage: (id, partial, department = "core") =>
        set((state) => {
          const deptMessages = state.messages[department] || [];
          return {
            messages: {
              ...state.messages,
              [department]: deptMessages.map((m) =>
                m.id === id ? { ...m, ...partial } : m
              ),
            },
          };
        }),
      appendToMessage: (id, delta, department = "core") =>
        set((state) => {
          const deptMessages = state.messages[department] || [];
          return {
            messages: {
              ...state.messages,
              [department]: deptMessages.map((m) =>
                m.id === id ? { ...m, content: m.content + delta } : m
              ),
            },
          };
        }),
      setThinking: (v) => set({ isThinking: v }),
      clearMessages: (department?: string) =>
        set((state) => {
          if (department) {
            return {
              messages: {
                ...state.messages,
                [department]: [],
              },
            };
          }
          return { messages: {} };
        }),
    }),
    {
      name: "edith-chat-store",
      partialize: (state) => {
        const sanitizedMessages: Record<string, Message[]> = {};
        for (const [dept, msgs] of Object.entries(state.messages)) {
          sanitizedMessages[dept] = msgs.map((message) =>
            message.attachments
              ? {
                  ...message,
                  attachments: sanitizeAttachments(message.attachments),
                }
              : message
          );
        }
        return {
          messages: sanitizedMessages,
          currentDepartment: state.currentDepartment,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.isThinking = false;
        
        // Handle migration from old array format to new Record format
        if (Array.isArray(state.messages)) {
          state.messages = {};
          return;
        }
        
        // Clean up existing record format
        const cleanedMessages: Record<string, Message[]> = {};
        for (const [dept, msgs] of Object.entries(state.messages)) {
          if (Array.isArray(msgs)) {
            cleanedMessages[dept] = msgs.map((message) => ({
              ...message,
              isStreaming: false,
            }));
          } else {
            cleanedMessages[dept] = [];
          }
        }
        state.messages = cleanedMessages;
      },
    }
  )
);
