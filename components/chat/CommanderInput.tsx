'use client';

import { useState, useRef } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

interface CommanderInputProps {
  onSend?: (message: string) => void;
  onVoiceStart?: () => void;
  isListening?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function CommanderInput({
  onSend,
  onVoiceStart,
  isListening = false,
  disabled = false,
  placeholder = 'Issue a directive to CORE module...',
}: CommanderInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend?.(input);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Input container */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
          isFocused
            ? 'border-cyan bg-surface-light cyan-glow'
            : 'border-cyan/15 bg-surface'
        }`}
      >
        {/* Attachment button */}
        <button
          type="button"
          className="p-1.5 text-cyan/60 hover:text-cyan transition-colors"
        >
          <Paperclip size={18} />
        </button>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-text-primary placeholder-text-tertiary outline-none font-sans text-sm"
        />

        {/* Voice button */}
        <button
          type="button"
          onClick={onVoiceStart}
          className={`p-1.5 transition-colors ${
            isListening ? 'animate-pulse-cyan text-cyan' : 'text-cyan/60 hover:text-cyan'
          }`}
        >
          <Mic size={18} />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-1.5 bg-cyan/10 border border-cyan/30 rounded-lg text-cyan hover:bg-cyan/20 hover:border-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Help text */}
      <div className="text-center mt-2 text-9px font-mono text-text-tertiary">
        Press Enter to send • Shift+Enter for new line
      </div>
    </form>
  );
}
