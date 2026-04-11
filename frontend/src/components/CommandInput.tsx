"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Sparkles, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { DEPARTMENT_COMMANDS, type DepartmentId } from '../departments';

interface CommandInputProps {
  onSendMessage: (message: string) => void;
  securityMode: boolean;
  activeDepartment: DepartmentId;
  departmentColor: string;
}

export function CommandInput({
  onSendMessage,
  securityMode,
  activeDepartment,
  departmentColor,
}: CommandInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const color = departmentColor;
  const commands = DEPARTMENT_COMMANDS[activeDepartment] || [];

  // Reset suggestions visibility on department change
  useEffect(() => {
    setShowSuggestions(true);
    setInput('');
    setShowEnhanceMenu(false);
  }, [activeDepartment]);

  const handleSubmit = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      setShowEnhanceMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleQuickCommand = (cmd: string) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  return (
    <div
      className="w-full pb-5 pt-3"
      style={{
        background: 'linear-gradient(to top, rgba(5,5,5,0.98) 60%, transparent)',
      }}
    >
      {/* Quick Command Suggestions */}
      <AnimatePresence>
        {showSuggestions && !input && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mb-3 flex-wrap"
          >
            <button
              className="flex items-center gap-1 text-white/20 hover:text-white/40 transition-colors"
              onClick={() => setShowSuggestions(false)}
            >
              <ChevronDown size={12} />
            </button>
            {commands.map((cmd) => (
              <motion.button
                key={cmd}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  background: `${color}0c`,
                  border: `1px solid ${color}20`,
                  color: color + 'aa',
                }}
                whileHover={{
                  scale: 1.03,
                  background: `${color}18`,
                  borderColor: `${color}40`,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickCommand(cmd)}
              >
                {cmd}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show suggestions button when hidden */}
      {!showSuggestions && (
        <motion.button
          className="flex items-center gap-1.5 mb-2 text-white/20 hover:text-white/40 transition-colors text-xs"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
          onClick={() => setShowSuggestions(true)}
        >
          <ChevronUp size={12} />
          SHOW SUGGESTIONS
        </motion.button>
      )}

      {/* Main Input Container */}
      <motion.div
        className="relative"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <motion.div
          className="relative backdrop-blur-xl rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10, 16, 30, 0.92)',
            border: `1px solid ${isFocused ? color : 'rgba(255,255,255,0.08)'}`,
            boxShadow: isFocused
              ? `0 0 24px ${color}25, 0 8px 32px rgba(0,0,0,0.6)`
              : '0 4px 24px rgba(0,0,0,0.5)',
          }}
          animate={{ borderColor: isFocused ? color : 'rgba(255,255,255,0.08)' }}
          transition={{ duration: 0.2 }}
        >
          {/* Glow overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: isFocused ? 0.04 : 0 }}
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${color}, transparent 60%)`,
            }}
          />

          <div className="flex items-end gap-3 p-3">
            {/* Voice Button */}
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative"
              style={{
                background: isListening
                  ? `${color}25`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isListening ? color + '50' : 'rgba(255,255,255,0.08)'}`,
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsListening(!isListening)}
            >
              <Mic size={16} style={{ color: isListening ? color : 'rgba(255,255,255,0.5)' }} />
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-xl flex items-center justify-center gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 rounded-full"
                        style={{ background: color }}
                        animate={{ height: ['3px', '14px', '3px'] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={`Issue directive to ${activeDepartment.toUpperCase()} module...`}
                className="w-full bg-transparent text-white resize-none outline-none placeholder:text-white/20 min-h-[44px] max-h-[140px] py-2.5"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}
                rows={1}
              />
            </div>

            {/* Enhance Button */}
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: showEnhanceMenu ? `${color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showEnhanceMenu ? color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowEnhanceMenu(!showEnhanceMenu)}
            >
              <Sparkles size={16} style={{ color: showEnhanceMenu ? color : 'rgba(255,255,255,0.4)' }} />
            </motion.button>

            {/* Send Button */}
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: input.trim()
                  ? `linear-gradient(135deg, ${color}cc, ${color}80)`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${input.trim() ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: input.trim() ? `0 0 14px ${color}30` : 'none',
              }}
              whileHover={{ scale: input.trim() ? 1.06 : 1 }}
              whileTap={{ scale: input.trim() ? 0.94 : 1 }}
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              <Send size={16} className="text-white" />
            </motion.button>
          </div>

          {/* Bottom info bar */}
          <div
            className="flex items-center justify-between px-4 pb-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}
          >
            <span
              className="text-xs"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: color + '60', fontSize: '10px' }}
            >
              {securityMode ? 'TACTICAL MODE' : `MODULE ${DEPARTMENT_COMMANDS[activeDepartment] ? String(Object.keys(DEPARTMENT_COMMANDS).indexOf(activeDepartment) + 1).padStart(2, '0') : '01'} · ACTIVE`}
            </span>
            <span
              className="text-xs"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}
            >
              ↵ send · shift+↵ newline
            </span>
          </div>
        </motion.div>

        {/* Enhance Radial Menu */}
        <AnimatePresence>
          {showEnhanceMenu && (
            <motion.div
              className="absolute bottom-20 right-0"
              initial={{ scale: 0.9, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 25 }}
            >
              <div
                className="backdrop-blur-xl rounded-xl p-1.5 min-w-[180px]"
                style={{
                  background: 'rgba(8, 14, 28, 0.95)',
                  border: `1px solid ${color}25`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${color}15`,
                }}
              >
                <div className="px-3 py-1.5 mb-1 border-b border-white/5">
                  <span className="text-white/30 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>
                    ENHANCE DIRECTIVE
                  </span>
                </div>
                {[
                  { label: 'Refine Prompt', desc: 'Sharpen clarity & precision' },
                  { label: 'Tree of Thought', desc: 'Multi-path reasoning' },
                  { label: 'Chain of Thought', desc: 'Step-by-step breakdown' },
                  { label: 'Execute Task', desc: 'Autonomous agent mode' },
                ].map((action, i) => (
                  <motion.button
                    key={action.label}
                    className="w-full px-3 py-2 text-left rounded-lg"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ background: `${color}12` }}
                    onClick={() => {
                      setInput((prev) => prev ? `[${action.label}] ${prev}` : `[${action.label}] `);
                      setShowEnhanceMenu(false);
                      inputRef.current?.focus();
                    }}
                  >
                    <div className="text-xs text-white" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                      {action.label}
                    </div>
                    <div className="text-white/30 mt-0.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px' }}>
                      {action.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
