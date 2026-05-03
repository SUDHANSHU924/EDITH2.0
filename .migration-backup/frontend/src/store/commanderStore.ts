import { create } from "zustand";

interface CommanderStore {
  sessionId: string;
  input: string;
  setInput: (value: string) => void;
  setSessionId: (value: string) => void;
}

export const useCommanderStore = create<CommanderStore>((set) => ({
  sessionId: "default",
  input: "",
  setInput: (value) => set({ input: value }),
  setSessionId: (value) => set({ sessionId: value }),
}));
