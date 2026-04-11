'use client';

import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="my-4 rounded-lg border border-cyan-500/20 bg-edith-darker overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/20">
        <span className="text-xs font-mono text-cyan-400">{language.toUpperCase()}</span>
        <motion.button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="text-xs">Copy</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Code */}
      <pre className="px-4 py-3 overflow-x-auto text-sm font-mono text-foreground">
        <code>{code}</code>
      </pre>
    </motion.div>
  );
}
