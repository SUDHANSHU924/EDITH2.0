"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useEdith } from "@/hooks/useEdith";
import { useCommanderStore } from "@/store/commanderStore";

export default function CommanderInput() {
  const { sendMessage, isThinking } = useEdith();
  const input = useCommanderStore((state) => state.input);
  const setInput = useCommanderStore((state) => state.setInput);
  const [localSending, setLocalSending] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLocalSending(true);
    try {
      await sendMessage(input);
      setInput("");
    } finally {
      setLocalSending(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="glass border-t border-cyan/20 px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Transmit command..."
          className="h-12 flex-1 resize-none bg-transparent text-sm text-white/80 outline-none"
        />
        <button
          type="submit"
          disabled={isThinking || localSending}
          className="flex items-center gap-2 border border-cyan/50 px-4 py-2 text-xs font-mono uppercase tracking-[0.3em] text-cyan transition hover:bg-cyan/20 disabled:opacity-40"
        >
          Send
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
