import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlwaysOn } from '@/hooks/useAlwaysOn';
import { parseAndExecute } from '@/lib/actions';

interface Props {
  onConversation: (transcript: string, reply: string, system: string) => void;
  accentColor?: string;
}

export function AlwaysOnIndicator({ onConversation, accentColor = '#00F0FF' }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [log, setLog]         = useState<{ role: 'you' | 'edith'; text: string }[]>([]);
  const [permDenied, setPermDenied] = useState(false);

  // ── Restore saved preference on mount (no auto-start if mic is just "granted") ──
  useEffect(() => {
    const saved = localStorage.getItem('edith-always-on');
    if (saved === 'true') {
      // Only auto-resume if user explicitly saved this preference
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') setEnabled(true);
          else if (result.state === 'denied') setPermDenied(true);
        })
        .catch(() => {
          // Permissions API not supported — honour saved pref
          setEnabled(true);
        });
    }
  }, []);

  // ── Persist preference ────────────────────────────────────────────────────
  useEffect(() => {
    if (enabled) localStorage.setItem('edith-always-on', 'true');
  }, [enabled]);

  const handleConversation = useCallback((text: string, reply: string, system: string) => {
    const cleanReply = parseAndExecute(reply);
    setLog((prev) => [
      ...prev.slice(-6),
      { role: 'you',   text },
      { role: 'edith', text: cleanReply.slice(0, 80) + (cleanReply.length > 80 ? '…' : '') },
    ]);
    onConversation(text, cleanReply, system);
  }, [onConversation]);

  const handleToggle = async () => {
    if (!enabled) {
      try {
        setPermDenied(false);
        setEnabled(true);
        localStorage.setItem('edith-always-on', 'true');
      } catch {
        setPermDenied(true);
      }
    } else {
      setEnabled(false);
      localStorage.setItem('edith-always-on', 'false');
    }
  };

  const { status, volume, error } = useAlwaysOn(handleConversation, enabled);
  const isListening = status === 'listening' || status === 'recording' || status === 'processing';
  const isSpeaking = status === 'speaking';

  const color = permDenied
    ? '#FF2A4B'
    : !enabled
    ? 'rgba(255,255,255,0.15)'
    : isSpeaking
    ? '#00F0FF'
    : status === 'processing'
    ? '#7B61FF'
    : status === 'recording'
    ? '#FF2A4B'
    : '#00FF88';

  const label = permDenied
    ? 'MIC DENIED'
    : !enabled
    ? 'ALWAYS-ON'
    : isSpeaking
    ? 'EDITH SPEAKING'
    : status === 'processing'
    ? 'PROCESSING...'
    : status === 'recording'
    ? 'RECORDING...'
    : isListening
    ? 'ALWAYS LISTENING'
    : 'STARTING...';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', position: 'relative' }}>

      {/* Toggle button */}
      <motion.button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          background: enabled ? `${color}12` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${enabled ? color + '50' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '20px',
          padding: '5px 12px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.25s ease',
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title={
          permDenied
            ? 'Microphone access denied — allow mic in browser settings'
            : enabled
            ? 'EDITH is always listening — click to disable'
            : 'Click to enable always-on listening (no button press needed)'
        }
      >
        {/* Pulsing orb */}
        <motion.div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: color,
            boxShadow: enabled && !permDenied ? `0 0 8px ${color}` : 'none',
            flexShrink: 0,
          }}
          animate={enabled && !permDenied ? {
            scale: isSpeaking
              ? [1, 1.9, 1]
              : isListening
              ? [1, 1 + Math.min(volume * 14, 0.9), 1]
              : [1, 1.3, 1],
            opacity: [1, 0.55, 1],
          } : { scale: 1, opacity: permDenied ? 0.6 : 0.35 }}
          transition={{ repeat: Infinity, duration: isSpeaking ? 0.45 : 1.5 }}
        />

        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          color: enabled ? color : permDenied ? '#FF2A4B' : 'rgba(255,255,255,0.25)',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </motion.button>
      {error && (
        <div style={{
          color: '#FF2A4B',
          fontFamily: 'JetBrains Mono',
          fontSize: '9px',
          padding: '4px 8px',
          background: 'rgba(255,42,75,0.08)',
          border: '1px solid rgba(255,42,75,0.2)',
          borderRadius: '6px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Live volume bar */}
      <AnimatePresence>
        {enabled && isListening && !isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            style={{
              width: '140px',
              height: '2px',
              background: 'rgba(0,255,136,0.12)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{ height: '100%', background: '#00FF88', borderRadius: '2px', transformOrigin: 'left' }}
              animate={{ scaleX: Math.min(volume * 2500, 1) }}
              transition={{ duration: 0.06 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript log */}
      <AnimatePresence>
        {enabled && log.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            style={{
              background: 'rgba(4,6,14,0.96)',
              border: `1px solid ${color}22`,
              borderRadius: '8px',
              padding: '8px 11px',
              maxWidth: '220px',
              backdropFilter: 'blur(16px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${color}08`,
            }}
          >
            {log.slice(-4).map((l, i) => (
              <div key={i} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '8.5px',
                color: l.role === 'edith' ? color + 'cc' : 'rgba(255,255,255,0.45)',
                marginBottom: i < log.slice(-4).length - 1 ? '4px' : 0,
                lineHeight: 1.45,
              }}>
                <span style={{
                  color: l.role === 'edith' ? color + '80' : 'rgba(255,255,255,0.25)',
                  marginRight: '5px',
                }}>
                  {l.role === 'edith' ? 'EDITH' : 'YOU'}
                </span>
                {l.text}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
