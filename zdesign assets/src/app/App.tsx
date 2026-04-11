import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertOctagon, ChevronUp, ChevronDown } from 'lucide-react';
import { BackgroundGrid } from './components/BackgroundGrid';
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
  type: 'commander' | 'aura';
  content: string;
  isThinking?: boolean;
  departmentColor?: string;
}

// Master prompt activation message
const BOOT_MESSAGE = `AURA 2.0 — Online.
Commander recognized. Ready for directives.
Capabilities active: Code · Search · Files · Analysis · Security · Automation

All 12 command modules initialized. Select a department from The ORBIT or issue a directive.

How can I serve you today?`;

const AUTONOMY_STAGES = [
  { stage: 1, label: 'DIRECTED', desc: 'Commander specifies every task explicitly' },
  { stage: 2, label: 'DELEGATED', desc: 'Commander sets objectives; AURA executes' },
  { stage: 3, label: 'PROACTIVE', desc: 'AURA anticipates and suggests actions' },
  { stage: 4, label: 'MANAGED', desc: 'AURA handles routine, escalates decisions' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'aura',
      content: BOOT_MESSAGE,
      departmentColor: '#00F0FF',
    },
  ]);
  const [securityMode, setSecurityMode] = useState(false);
  const [showSecurityOverlay, setShowSecurityOverlay] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('core');
  const [autonomyStage, setAutonomyStage] = useState(1);
  const [showStageMenu, setShowStageMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentDept = DEPARTMENTS.find((d) => d.id === activeDepartment)!;
  const accentColor = securityMode ? '#FF2A4B' : currentDept.color;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close stage menu on outside click
  useEffect(() => {
    const handler = () => setShowStageMenu(false);
    if (showStageMenu) window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showStageMenu]);

  const handleDepartmentChange = (deptId: DepartmentId) => {
    if (deptId === activeDepartment) return;
    setActiveDepartment(deptId);

    const deptInfo = DEPARTMENTS.find((d) => d.id === deptId)!;
    const switchMsg: Message = {
      id: Date.now(),
      type: 'aura',
      content: DEPARTMENT_WELCOMES[deptId],
      departmentColor: deptInfo.color,
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  const handleSendMessage = (content: string) => {
    if (content.toLowerCase().includes('/engage-security-grid')) {
      setShowSecurityOverlay(true);
      return;
    }
    if (content.toLowerCase() === 'shutdown') {
      setMessages([]);
      setTimeout(() => {
        setMessages([
          {
            id: Date.now(),
            type: 'aura',
            content: '// STANDING BY — Commander Override Received.',
            departmentColor: '#00F0FF',
          },
        ]);
      }, 500);
      return;
    }

    const cmdMsg: Message = {
      id: Date.now(),
      type: 'commander',
      content,
      departmentColor: currentDept.color,
    };
    setMessages((prev) => [...prev, cmdMsg]);

    const thinkMsg: Message = {
      id: Date.now() + 1,
      type: 'aura',
      content: '',
      isThinking: true,
      departmentColor: currentDept.color,
    };
    setMessages((prev) => [...prev, thinkMsg]);

    const delay = 2000 + Math.random() * 1400;
    setTimeout(() => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isThinking);
        const responses = AI_RESPONSES[activeDepartment];
        return [
          ...filtered,
          {
            id: Date.now() + 2,
            type: 'aura',
            content: responses[Math.floor(Math.random() * responses.length)],
            departmentColor: currentDept.color,
          },
        ];
      });
    }, delay);
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
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'aura',
        content:
          '⚠️ Commander Override Protocol activated. All autonomous operations halted. Awaiting explicit directive.',
        departmentColor: '#FF2A4B',
      },
    ]);
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
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

      {/* Left Sidebar — The ORBIT (offset by HUD bar) */}
      <div className="fixed left-0 top-8 bottom-0 z-50">
        <OrbitSidebar
          securityMode={securityMode}
          onSecurityToggle={handleSecurityToggle}
          activeDepartment={activeDepartment}
          onDepartmentChange={handleDepartmentChange}
        />
      </div>

      {/* Right Sidebar — The PERIPHERY (offset by HUD bar) */}
      <div className="fixed right-0 top-8 bottom-0 z-40">
        <PeripherySidebar
          securityMode={securityMode}
          activeDepartment={activeDepartment}
        />
      </div>

      {/* Center — The HORIZON (offset by HUD bar) */}
      <div className="absolute left-[72px] right-80 top-8 bottom-0 flex flex-col">

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
                AURA 2.0{' '}
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
        <div className="flex-1 overflow-y-auto px-7 py-6 pb-44 horizon-scroll">
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
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
      </div>

      {/* Command Input — The PEDESTAL */}
      <CommandInput
        onSendMessage={handleSendMessage}
        securityMode={securityMode}
        activeDepartment={activeDepartment}
        departmentColor={accentColor}
      />

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
