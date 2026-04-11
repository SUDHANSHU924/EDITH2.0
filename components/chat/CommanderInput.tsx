'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Paperclip } from 'lucide-react';

interface CommanderInputProps {
  onSend?: (message: string) => void;
  onVoiceStart?: () => void;
  isListening?: boolean;
  disabled?: boolean;
}

export function CommanderInput({
  onSend,
  onVoiceStart,
  isListening = false,
  disabled = false,
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
    <motion.form
      onSubmit={handleSubmit}
      className="px-6 py-4 border-t border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
          transition-all duration-200 bg-input
          ${isFocused ? 'border-primary ring-2 ring-primary/30' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Attach file button */}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Attach file"
          disabled={disabled}
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
          placeholder="Issue a directive to CORE module..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground font-sans"
          disabled={disabled}
        />

        {/* Voice button */}
        <motion.button
          type="button"
          onClick={onVoiceStart}
          className={`
            flex items-center justify-center w-8 h-8 rounded transition-all duration-200
            ${isListening ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground hover:text-foreground'}
          `}
          title={isListening ? 'Listening...' : 'Voice input'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
        >
          {isListening && (
            <motion.div
              className="absolute w-8 h-8 rounded border border-red-500/50 rounded"
              animate={{ scale: [1, 1.2] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
          <Mic size={18} />
        </motion.button>

        {/* Send button */}
        <motion.button
          type="submit"
          className="
            flex items-center justify-center w-8 h-8 rounded-lg
            bg-gradient-to-br from-cyan-500/30 to-blue-600/30
            text-cyan-400 hover:from-cyan-500/50 hover:to-blue-600/50
            transition-all duration-200 border border-cyan-500/40
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          title="Send message"
          disabled={disabled || !input.trim()}
        >
          <Send size={16} />
        </motion.button>
      </div>

      {/* Helper text */}
      <div className="mt-2 text-xs text-muted-foreground font-mono">
        Press Enter to send • Shift+Enter for new line
      </div>
    </motion.form>
  );
}
