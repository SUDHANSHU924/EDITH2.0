import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Copy, Check, Terminal } from 'lucide-react';
import { ThinkingVisualization } from './ThinkingVisualization';
import type { Attachment } from '@/types/message.types';

interface MessageBubbleProps {
  type: 'commander' | 'edith';
  content: string;
  isThinking?: boolean;
  securityMode?: boolean;
  departmentColor?: string;
  attachments?: Attachment[];
  kind?: 'analysis' | 'default';
}

type ContentPart =
  | { type: 'text'; content: string }
  | { type: 'code'; content: string; lang: string }
  | { type: 'planmode'; content: string }
  | { type: 'tasklog'; content: string };

function parseContent(raw: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textSlice = raw.slice(lastIndex, match.index).trim();
      if (textSlice) pushTextParts(textSlice, parts);
    }
    parts.push({ type: 'code', content: match[2].trim(), lang: match[1] || 'text' });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < raw.length) {
    const remaining = raw.slice(lastIndex).trim();
    if (remaining) pushTextParts(remaining, parts);
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: raw }];
}

function pushTextParts(text: string, parts: ContentPart[]) {
  if (text.includes('[EDITH PLANNING MODE]')) {
    parts.push({ type: 'planmode', content: text });
  } else if (text.match(/^[✅🔄⏳⚠️]/m) || text.includes('[EDITH TASK LOG]')) {
    parts.push({ type: 'tasklog', content: text });
  } else {
    parts.push({ type: 'text', content: text });
  }
}

function CodeBlock({ content, lang, color }: { content: string; lang: string; color: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const displayLang = lang && lang !== 'text' ? lang.toUpperCase() : 'CODE';

  return (
    <div
      className="my-3 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: `1px solid ${color}22`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset`,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: `${color}0a`, borderBottom: `1px solid ${color}18` }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={11} style={{ color: color + '80' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: color + '90', letterSpacing: '0.08em' }}>
            {displayLang}
          </span>
        </div>
        <motion.button
          className="flex items-center gap-1.5 px-2 py-0.5 rounded"
          style={{
            background: copied ? `${color}20` : 'transparent',
            border: `1px solid ${copied ? color + '40' : 'rgba(255,255,255,0.08)'}`,
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleCopy}
        >
          {copied ? <Check size={10} style={{ color }} /> : <Copy size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: copied ? color : 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
            {copied ? 'COPIED' : 'COPY'}
          </span>
        </motion.button>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col pt-3 pb-3 select-none" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {content.split('\n').map((_, i) => (
            <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', lineHeight: '1.6', color: 'rgba(255,255,255,0.15)', textAlign: 'right', paddingRight: '8px', paddingLeft: '4px' }}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="overflow-x-auto py-3 pl-14 pr-4" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: '1.6', color: 'rgba(255,255,255,0.88)', margin: 0 }}>
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

function PlanModeBlock({ content, color }: { content: string; color: string }) {
  return (
    <div className="my-3 rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}25` }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: `1px solid ${color}18`, background: `${color}0c` }}>
        <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color, letterSpacing: '0.08em' }}>EDITH PLANNING MODE</span>
      </div>
      <div className="px-4 py-3">
        <TextContent content={content.replace('[EDITH PLANNING MODE]', '').trim()} color={color} />
      </div>
    </div>
  );
}

function TaskLogBlock({ content, color }: { content: string; color: string }) {
  const lines = content.replace('[EDITH TASK LOG]', '').split('\n').filter((l) => l.trim());

  const getLineStyle = (line: string) => {
    if (line.startsWith('✅')) return { icon: '✅', color: '#2FD4A3' };
    if (line.startsWith('🔄')) return { icon: '🔄', color: '#4F8EF7' };
    if (line.startsWith('⏳')) return { icon: '⏳', color: '#F5A623' };
    if (line.startsWith('⚠️')) return { icon: '⚠️', color: '#FF2A4B' };
    return { icon: '→', color: 'rgba(255,255,255,0.5)' };
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: `1px solid rgba(255,255,255,0.05)`, background: `${color}08` }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: color + '90', letterSpacing: '0.08em' }}>EDITH TASK LOG</span>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        {lines.map((line, i) => {
          const { icon, color: lineColor } = getLineStyle(line);
          const text = line.replace(/^[✅🔄⏳⚠️→]\s?/, '').trim();
          return (
            <motion.div key={i} className="flex items-start gap-2.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <span style={{ fontSize: '11px', flexShrink: 0, lineHeight: '1.6' }}>{icon}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '1.6', color: lineColor }}>{text}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function renderInlineBrackets(text: string, color: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('[') && part.endsWith(']') ? (
          <span key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: color + 'cc', background: `${color}12`, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${color}25` }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function TextContent({ content, color }: { content: string; color: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        if (line.trim().startsWith('→') || line.trim().startsWith('▸')) {
          const text = line.replace(/^\s*[→▸]\s?/, '');
          return (
            <div key={i} className="flex items-start gap-2.5 py-0.5">
              <span className="flex-shrink-0 mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: color + '80', lineHeight: '1.6' }}>→</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.85)' }}>{renderInlineBrackets(text, color)}</span>
            </div>
          );
        }

        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          const text = line.replace(/^\s*[•\-]\s?/, '');
          return (
            <div key={i} className="flex items-start gap-2 py-0.5 ml-2">
              <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2.5" style={{ background: color + '70' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.8)' }}>{text}</span>
            </div>
          );
        }

        const numMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2.5 py-0.5 ml-1">
              <span className="flex-shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: color + '80', lineHeight: '1.65', minWidth: '16px' }}>{numMatch[1]}.</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.82)' }}>{numMatch[2]}</span>
            </div>
          );
        }

        return (
          <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.85)' }}>
            {renderInlineBrackets(line, color)}
          </p>
        );
      })}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function AttachmentTray({ attachments, color }: { attachments: Attachment[]; color: string }) {
  return (
    <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
      {attachments.map((attachment) => (
        <div key={attachment.id} className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}20` }}>
          {attachment.previewUrl && attachment.type.startsWith('image/') ? (
            <img src={attachment.previewUrl} alt={attachment.name} className="w-full h-24 object-cover" />
          ) : (
            <div className="h-24 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>
                {attachment.type.startsWith('image/') ? 'IMAGE' : 'FILE'}
              </span>
            </div>
          )}
          <div className="px-2 py-1.5">
            <div className="truncate" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>{attachment.name}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{formatBytes(attachment.size)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageBubble({
  type,
  content,
  isThinking,
  securityMode,
  departmentColor = '#00F0FF',
  attachments,
  kind = 'default',
}: MessageBubbleProps) {
  const isCommander = type === 'commander';
  const beamColor = securityMode ? '#FF2A4B' : departmentColor;
  const isAnalysis = !isCommander && kind === 'analysis';

  if (isThinking && !isCommander) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-6">
        <div className="max-w-3xl">
          <ThinkingVisualization color={beamColor} />
        </div>
      </motion.div>
    );
  }

  const parts = !isCommander ? parseContent(content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      className={`flex ${isCommander ? 'justify-end' : 'justify-start'} mb-5`}
    >
      <div className={`${isCommander ? 'max-w-[72%]' : 'max-w-[90%] w-full'} ${isCommander ? 'text-right' : 'text-left'}`}>
        {isCommander && (
          <div className="inline-block max-w-full text-left">
            <motion.div
              className="inline-block px-5 py-3.5 rounded-2xl rounded-tr-sm"
              style={{
                border: '1px solid rgba(255,255,255,0.09)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <p className="text-white leading-relaxed flex-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.92)' }}>
                  {content}
                </p>
                <motion.div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.12, type: 'spring' }}>
                  <Lock size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                </motion.div>
              </div>
            </motion.div>
            {attachments && attachments.length > 0 && <AttachmentTray attachments={attachments} color={beamColor} />}
            <div className="mt-1.5 text-right" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
              {new Date().toLocaleTimeString('en-US', { hour12: false })} · CMD
            </div>
          </div>
        )}

        {!isCommander && (
          <div className="w-full">
            <motion.div className="relative pl-4">
              <motion.div
                className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
                style={{ background: `linear-gradient(to bottom, ${beamColor}, ${beamColor}50)`, transformOrigin: 'top' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: beamColor }}
                  animate={{ opacity: [0.3, 0.8, 0.3], scaleX: [1, 2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>

              <div
                className="py-1 pl-1"
                style={isAnalysis ? { background: `${beamColor}08`, border: `1px solid ${beamColor}20`, borderRadius: '12px', padding: '10px 12px' } : undefined}
              >
                {isAnalysis && (
                  <div className="mb-2 inline-flex items-center px-2 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: beamColor, background: `${beamColor}18`, letterSpacing: '0.08em' }}>
                    ANALYSIS
                  </div>
                )}
                {parts!.map((part, i) => {
                  if (part.type === 'code') return <CodeBlock key={i} content={part.content} lang={part.lang} color={beamColor} />;
                  if (part.type === 'planmode') return <PlanModeBlock key={i} content={part.content} color={beamColor} />;
                  if (part.type === 'tasklog') return <TaskLogBlock key={i} content={part.content} color={beamColor} />;
                  return <TextContent key={i} content={part.content} color={beamColor} />;
                })}
              </div>
            </motion.div>

            <div className="mt-1.5 ml-5 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>
              <span style={{ color: beamColor + '70', letterSpacing: '0.06em' }}>EDITH</span>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
              <span style={{ color: securityMode ? '#FF2A4B70' : 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>{securityMode ? 'SECURITY MODE' : 'ONLINE'}</span>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
