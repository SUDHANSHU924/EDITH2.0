"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertOctagon, ChevronUp, ChevronDown } from 'lucide-react';
import { BackgroundGrid } from './components/BackgroundGrid';
import { useEdith } from './hooks/useEdith';
import { useChatStore } from './store/chatStore';
import { checkHealth } from './lib/api';
import { OrbitSidebar } from './components/OrbitSidebar';
import { CommandInput } from './components/CommandInput';
import { MessageBubble } from './components/MessageBubble';
import { PeripherySidebar } from './components/PeripherySidebar';
import { SecurityModeOverlay } from './components/SecurityModeOverlay';
import { HudStatusBar } from './components/HudStatusBar';
import {
  DEPARTMENTS,
  DEPARTMENT_WELCOMES,
  AI_RESPONSES,
  type DepartmentId,
} from './departments';

interface Message {
  id: number;
  type: 'commander' | 'edith';
  content: string;
  isThinking?: boolean;
  departmentColor?: string;
}

// Master prompt activation message
const BOOT_MESSAGE = `EDITH 2.0 — Online.
Commander recognized. Ready for directives.
Capabilities active: Code · Search · Files · Analysis · Security · Automation

All 12 command modules initialized. Select a department from The ORBIT or issue a directive.

How can I serve you today?`;

const AUTONOMY_STAGES = [
  { stage: 1, label: 'DIRECTED', desc: 'Commander specifies every task explicitly' },
  { stage: 2, label: 'DELEGATED', desc: 'Commander sets objectives; EDITH executes' },
  { stage: 3, label: 'PROACTIVE', desc: 'EDITH anticipates and suggests actions' },
  { stage: 4, label: 'MANAGED', desc: 'EDITH handles routine, escalates decisions' },
];

export default function App() {
  const chatMessages = useChatStore((state) => state.messages);
  const [securityMode, setSecurityMode] = useState(false);
  const [showSecurityOverlay, setShowSecurityOverlay] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('core');
  const [autonomyStage, setAutonomyStage] = useState(1);
  const [showStageMenu, setShowStageMenu] = useState(false);
  const { sendMessage, isThinking } = useEdith('commander-session', activeDepartment);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentDept = DEPARTMENTS.find((d) => d.id === activeDepartment)!;
  const accentColor = securityMode ? '#FF2A4B' : currentDept.color;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const displayMessages = chatMessages.length === 0 ? [{
    id: 1,
    type: 'edith' as 'commander'|'edith',
    content: BOOT_MESSAGE,
    departmentColor: '#00F0FF',
  }] : chatMessages.map((m) => ({
    id: m.id || Date.now(),
    type: (m.role === 'user' ? 'commander' : 'edith') as 'commander' | 'edith',
    content: m.content || '',
    isThinking: m.isStreaming,
    departmentColor: currentDept.color,
  }));

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  // Check backend health on load
  useEffect(() => {
    checkHealth().then(online => {
      if (online) {
        console.log('✓ EDITH backend connected')
      } else {
        console.warn('⚠ EDITH backend offline')
      }
    })
  }, [])

  // Close stage menu on outside click
  useEffect(() => {
    const handler = () => setShowStageMenu(false);
    if (showStageMenu) window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showStageMenu]);

  const handleDepartmentChange = (deptId: DepartmentId) => {
    if (deptId === activeDepartment) return;
    setActiveDepartment(deptId);
  };

  const handleSendMessage = (content: string) => {
    if (content.toLowerCase().includes('/engage-security-grid')) {
      setShowSecurityOverlay(true);
      return;
    }
    if (content.toLowerCase() === 'shutdown') {
      useChatStore.getState().clearMessages();
      useChatStore.getState().addMessage({
         role: 'assistant',
         content: '// STANDING BY — Commander Override Received.',
         timestamp: new Date().toISOString()
      });
      return;
    }

    sendMessage(content);
  };

  const handleSecurityToggle = () => {
    if (!securityMode) {
      setShowSecurityOverlay(true);
    } else {
      setSecurityMode(false);
    }
  };

  const handleSecurityOverlayComplete = () => {
    setShowSecurityOverlay(false);
    setSecurityMode(true);
    setActiveDepartment('security');
  };

  const handleCommanderOverride = () => {
    if (securityMode) {
      setSecurityMode(false);
      setActiveDepartment('core');
    }
    useChatStore.getState().addMessage({
      role: 'assistant',
      content: '⚠️ Commander Override Protocol activated. All autonomous operations halted. Awaiting explicit directive.',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#050505", display: "flex", flexDirection: "column" }}
      style={{ background: '#050505' }}
    >
      {/* Background */}
      <BackgroundGrid />

      {/* HUD Status Bar — top rail */}
      <HudStatusBar
        securityMode={securityMode}
        activeDepartment={activeDepartment}
        autonomyStage={autonomyStage}
        accentColor={accentColor}
      />

      {/* Security Overlay */}
      <AnimatePresence>
        {showSecurityOverlay && (
          <SecurityModeOverlay onComplete={handleSecurityOverlayComplete} />
        )}
      </AnimatePresence>

      {/* THREE PANELS ROW */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Left Sidebar — The ORBIT */}
        <div style={{ flexShrink: 0, height: '100%', zIndex: 10, position: 'relative' }}>
          <OrbitSidebar
            securityMode={securityMode}
            onSecurityToggle={handleSecurityToggle}
            activeDepartment={activeDepartment}
            onDepartmentChange={handleDepartmentChange}
          />
        </div>

        {/* Center — The HORIZON */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          position: 'relative'
        }}>

        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-3.5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${accentColor}12` }}
        >
          {/* Left: Dept identity */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}35`,
              }}
              animate={{
                boxShadow: [
                  `0 0 8px ${accentColor}20`,
                  `0 0 18px ${accentColor}40`,
                  `0 0 8px ${accentColor}20`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {(() => {
                const Icon = currentDept.icon;
                return <Icon size={16} style={{ color: accentColor }} />;
              })()}
            </motion.div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.08em',
                  }}
                >
                  MODULE {currentDept.moduleNum}
                </span>
                <span style={{ color: accentColor + '60', fontSize: '7px' }}>◆</span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    color: accentColor + 'bb',
                    letterSpacing: '0.05em',
                  }}
                >
                  {securityMode ? 'TACTICAL MODE ACTIVE' : currentDept.subtitle.toUpperCase()}
                </span>
              </div>
              <div
                className="text-white"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '15px' }}
              >
                EDITH 2.0{' '}
                <span style={{ color: accentColor }}>// {currentDept.label}</span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">

            {/* Quick dept pills */}
            <div className="hidden xl:flex items-center gap-1">
              {DEPARTMENTS.slice(0, 5).map((dept) => (
                <motion.button
                  key={dept.id}
                  className="px-2 py-0.5 rounded text-xs transition-all"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    color: activeDepartment === dept.id ? dept.color : 'rgba(255,255,255,0.22)',
                    border: `1px solid ${
                      activeDepartment === dept.id ? dept.color + '40' : 'rgba(255,255,255,0.05)'
                    }`,
                    background:
                      activeDepartment === dept.id ? dept.color + '10' : 'transparent',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDepartmentChange(dept.id)}
                >
                  {dept.shortLabel}
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.07)' }} />

            {/* Autonomy Stage selector */}
            <div className="relative">
              <motion.button
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: `${accentColor}0e`,
                  border: `1px solid ${accentColor}28`,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                  color: accentColor + 'cc',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStageMenu(!showStageMenu);
                }}
              >
                <span style={{ letterSpacing: '0.05em' }}>
                  S{autonomyStage} · {AUTONOMY_STAGES[autonomyStage - 1].label}
                </span>
                {showStageMenu ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
              </motion.button>

              {/* Stage dropdown */}
              <AnimatePresence>
                {showStageMenu && (
                  <motion.div
                    className="absolute top-9 right-0 z-50 min-w-[220px] rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(8,12,22,0.97)',
                      border: `1px solid ${accentColor}25`,
                      boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${accentColor}10`,
                      backdropFilter: 'blur(16px)',
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="px-3 py-2 border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '9px',
                          color: 'rgba(255,255,255,0.25)',
                          letterSpacing: '0.1em',
                        }}
                      >
                        AUTONOMY STAGE
                      </span>
                    </div>
                    {AUTONOMY_STAGES.map((s) => (
                      <motion.button
                        key={s.stage}
                        className="w-full flex items-start gap-3 px-3 py-2.5 text-left"
                        style={{
                          background:
                            autonomyStage === s.stage ? `${accentColor}0e` : 'transparent',
                          borderLeft:
                            autonomyStage === s.stage ? `2px solid ${accentColor}` : '2px solid transparent',
                        }}
                        whileHover={{ background: `${accentColor}08` }}
                        onClick={() => {
                          setAutonomyStage(s.stage);
                          setShowStageMenu(false);
                        }}
                      >
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
                          style={{
                            background:
                              autonomyStage === s.stage ? `${accentColor}25` : 'rgba(255,255,255,0.05)',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '9px',
                            color: autonomyStage === s.stage ? accentColor : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          {s.stage}
                        </span>
                        <div>
                          <div
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '10px',
                              color:
                                autonomyStage === s.stage ? accentColor : 'rgba(255,255,255,0.6)',
                            }}
                          >
                            {s.label}
                          </div>
                          <div
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '10px',
                              color: 'rgba(255,255,255,0.25)',
                              marginTop: '1px',
                            }}
                          >
                            {s.desc}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                    <div
                      className="px-3 py-2 border-t"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        Commander Override available at all stages.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Commander Override button */}
            <motion.button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{
                background: 'rgba(255,42,75,0.06)',
                border: '1px solid rgba(255,42,75,0.2)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
                color: 'rgba(255,42,75,0.7)',
                letterSpacing: '0.05em',
              }}
              whileHover={{
                scale: 1.03,
                background: 'rgba(255,42,75,0.12)',
                borderColor: 'rgba(255,42,75,0.4)',
                color: '#FF2A4B',
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCommanderOverride}
              title="Commander Override — halt all autonomous operations"
            >
              <AlertOctagon size={10} />
              OVERRIDE
            </motion.button>

            {/* Security mode badge */}
            <AnimatePresence>
              {securityMode && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(255,42,75,0.08)',
                    border: '1px solid rgba(255,42,75,0.28)',
                  }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#FF2A4B' }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '9px',
                      color: '#FF2A4B',
                      letterSpacing: '0.06em',
                    }}
                  >
                    ETHICAL HACKER
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-7 py-6 pb-44 horizon-scroll" style={{ minHeight: 0 }}>
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {displayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                type={message.type}
                content={message.content}
                isThinking={message.isThinking}
                securityMode={securityMode}
                departmentColor={message.departmentColor || currentDept.color}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Command Input — The PEDESTAL */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', zIndex: 20 }}>
          <CommandInput
            onSendMessage={handleSendMessage}
            securityMode={securityMode}
            activeDepartment={activeDepartment}
            departmentColor={accentColor}
          />
        </div>
      </div>

      {/* Right Sidebar — The PERIPHERY */}
      <div style={{ flexShrink: 0, width: '320px', height: '100%', overflowY: 'auto', borderLeft: '1px solid rgba(0,240,255,0.08)' }}>
        <PeripherySidebar
          securityMode={securityMode}
          activeDepartment={activeDepartment}
        />
      </div>
    </div>

      <style>{`
        .horizon-scroll::-webkit-scrollbar { width: 3px; }
        .horizon-scroll::-webkit-scrollbar-track { background: transparent; }
        .horizon-scroll::-webkit-scrollbar-thumb { background: ${accentColor}30; border-radius: 2px; }
        .horizon-scroll::-webkit-scrollbar-thumb:hover { background: ${accentColor}55; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
