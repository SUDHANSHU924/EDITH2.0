import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Download, Terminal, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  accentColor?: string;
}

interface AgentStatus {
  connected: boolean;
  recent_commands?: { action: string; status: string; result?: string }[];
}

export function DesktopAgentPanel({ accentColor = '#00F0FF' }: Props) {
  const [status, setStatus]       = useState<AgentStatus>({ connected: false });
  const [expanded, setExpanded]   = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied]       = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/desktop/status');
      if (res.ok) setStatus(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    const iv = setInterval(fetchStatus, 4000);
    return () => clearInterval(iv);
  }, [fetchStatus]);

  const origin = window.location.origin;
  const wsUrl  = origin.replace(/^http/, 'ws') + '/api/desktop/ws';

  const setupCommand = `pip install websockets pyautogui pillow\npython edith_desktop_agent.py --url ${wsUrl}`;

  const copySetup = () => {
    navigator.clipboard.writeText(setupCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const connected = status.connected;

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 12px' }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Monitor size={11} style={{ color: connected ? '#00FF88' : 'rgba(255,255,255,0.2)' }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            letterSpacing: '0.08em',
            color: connected ? '#00FF88' : 'rgba(255,255,255,0.3)',
          }}>
            DESKTOP AGENT
          </span>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: connected ? '#00FF88' : 'rgba(255,255,255,0.15)',
            boxShadow: connected ? '0 0 6px #00FF88' : 'none',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '8px',
            color: connected ? '#00FF88' : 'rgba(255,42,75,0.6)',
          }}>
            {connected ? 'ONLINE' : 'OFFLINE'}
          </span>
          {expanded ? <ChevronUp size={9} style={{ color: 'rgba(255,255,255,0.2)' }} /> : <ChevronDown size={9} style={{ color: 'rgba(255,255,255,0.2)' }} />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {/* Status card */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: connected ? 'rgba(0,255,136,0.06)' : 'rgba(255,42,75,0.06)',
                border: `1px solid ${connected ? 'rgba(0,255,136,0.2)' : 'rgba(255,42,75,0.15)'}`,
                borderRadius: '8px', padding: '8px 10px',
              }}>
                {connected
                  ? <CheckCircle size={13} style={{ color: '#00FF88', flexShrink: 0 }} />
                  : <XCircle size={13} style={{ color: '#FF2A4B', flexShrink: 0 }} />
                }
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: connected ? '#00FF88' : '#FF2A4B', margin: 0 }}>
                    {connected ? 'Agent running on your machine' : 'Agent not connected'}
                  </p>
                  <p style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
                    {connected
                      ? 'EDITH can open apps, type, click, screenshot'
                      : 'Run the agent script to enable desktop control'}
                  </p>
                </div>
              </div>

              {/* Capabilities */}
              {connected && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['Open Apps', 'Type Text', 'Keyboard', 'Click', 'Screenshot', 'Run Commands'].map(cap => (
                    <span key={cap} style={{
                      fontFamily: 'JetBrains Mono', fontSize: '7.5px',
                      color: '#00FF88aa', background: 'rgba(0,255,136,0.06)',
                      border: '1px solid rgba(0,255,136,0.15)',
                      borderRadius: '4px', padding: '2px 6px',
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>
              )}

              {/* Recent commands */}
              {connected && status.recent_commands && status.recent_commands.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '6px 8px' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: 'rgba(255,255,255,0.25)', margin: '0 0 4px' }}>
                    RECENT COMMANDS
                  </p>
                  {status.recent_commands.slice(-3).map((cmd, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7.5px', color: '#00F0FFaa' }}>{cmd.action}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: cmd.status === 'done' ? '#00FF88aa' : '#FF2A4Baa' }}>
                        [{cmd.status}]
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Setup toggle */}
              {!connected && (
                <motion.button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: `${accentColor}10`, border: `1px solid ${accentColor}30`,
                    borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', width: '100%',
                  }}
                  whileHover={{ background: `${accentColor}18` }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSetup(v => !v)}
                >
                  <Terminal size={10} style={{ color: accentColor }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: accentColor }}>
                    {showSetup ? 'HIDE SETUP' : 'HOW TO CONNECT'}
                  </span>
                </motion.button>
              )}

              <AnimatePresence>
                {showSetup && !connected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                      <p style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                        1. Download <code style={{ color: accentColor, background: 'rgba(0,240,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>edith_desktop_agent.py</code> from your Replit project files
                      </p>
                      <p style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                        2. Run on your machine:
                      </p>

                      <div style={{
                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px', padding: '8px 10px', position: 'relative',
                      }}>
                        <pre style={{
                          fontFamily: 'JetBrains Mono', fontSize: '8px',
                          color: '#00FF88', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                          lineHeight: 1.6,
                        }}>
                          {setupCommand}
                        </pre>
                        <motion.button
                          onClick={copySetup}
                          style={{
                            position: 'absolute', top: '4px', right: '4px',
                            background: copied ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${copied ? '#00FF88' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '4px', padding: '2px 6px', cursor: 'pointer',
                            fontFamily: 'JetBrains Mono', fontSize: '7px',
                            color: copied ? '#00FF88' : 'rgba(255,255,255,0.4)',
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copied ? 'COPIED' : 'COPY'}
                        </motion.button>
                      </div>

                      <p style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>
                        3. Once connected, EDITH can open apps, type text, take screenshots, and control everything on your machine.
                      </p>

                      {/* Download link */}
                      <motion.a
                        href="/api/desktop/download-agent"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
                          borderRadius: '6px', padding: '6px 10px', textDecoration: 'none',
                        }}
                        whileHover={{ background: 'rgba(0,255,136,0.14)' }}
                      >
                        <Download size={9} style={{ color: '#00FF88' }} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#00FF88' }}>
                          DOWNLOAD AGENT SCRIPT
                        </span>
                      </motion.a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
