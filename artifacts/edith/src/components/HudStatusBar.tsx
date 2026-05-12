import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { DEPARTMENTS, type DepartmentId } from '../departments';

interface HudStatusBarProps {
  securityMode: boolean;
  activeDepartment: DepartmentId;
  autonomyStage: number;
  accentColor: string;
  wsConnected?: boolean;
  activeSystem?: string;
  variant?: 'command' | 'marketing';
  navItems?: Array<{ label: string; href: string }>;
  ctaLabel?: string;
  ctaHref?: string;
}

export function HudStatusBar({
  securityMode,
  activeDepartment,
  autonomyStage,
  accentColor,
  wsConnected = false,
  activeSystem = 'core',
  variant = 'command',
  navItems,
  ctaLabel = 'Download Now',
  ctaHref = '/download',
}: HudStatusBarProps) {
  const [location] = useLocation();
  const [time, setTime] = useState('');
  const [ms, setMs] = useState('000');
  const [ping, setPing] = useState(34);
  const [signalLevel] = useState(4);
  const [cpuLoad, setCpuLoad] = useState(18);
  const [memLoad, setMemLoad] = useState(42);
  const [uptime, setUptime] = useState(0);
  const [tick, setTick] = useState(0);
  const moduleCount = DEPARTMENTS.length;

  useEffect(() => {
    const start = Date.now();
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setMs(String(now.getMilliseconds()).padStart(3, '0'));
      setUptime(Math.floor((Date.now() - start) / 1000));
      setTick(t => t + 1);
    };
    updateTime();
    const iv = setInterval(updateTime, 100);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setPing(28 + Math.floor(Math.random() * 18));
      setCpuLoad(12 + Math.floor(Math.random() * 22));
      setMemLoad(38 + Math.floor(Math.random() * 16));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const stageLabel = `STAGE ${autonomyStage}`;
  const stageDesc = ['DIRECTED', 'DELEGATED', 'PROACTIVE', 'MANAGED'][autonomyStage - 1];

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const pingColor = ping < 40 ? '#2FD4A3' : ping < 80 ? '#F5A623' : '#FF2A4B';

  const navigation = navItems ?? [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Download', href: '/download' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
  ];

  if (variant === 'marketing') {
    return (
      <div
        className="top-0 left-0 right-0 z-[70] flex items-center"
        style={{
          position: 'sticky',
          width: '100%',
          height: 64,
          background: 'rgba(4,6,10,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`,
            width: '30%',
          }}
          animate={{ x: ['-30%', '130%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 6 }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            padding: '0 24px',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14,
              color: '#00F0FF',
              letterSpacing: '0.18em',
              textDecoration: 'none',
            }}
          >
            E.D.I.T.H
          </Link>

          <nav
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            {navigation.map((item) => {
              const active = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    color: active ? '#00F0FF' : 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    padding: '6px 8px',
                    borderRadius: 8,
                    border: active ? '1px solid rgba(0,240,255,0.35)' : '1px solid transparent',
                    background: active ? 'rgba(0,240,255,0.12)' : 'transparent',
                  }}
                >
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
          </nav>

          <Link
            href={ctaHref}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: '#00F0FF',
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid rgba(0,240,255,0.5)',
              background: 'rgba(0,240,255,0.12)',
              boxShadow: '0 0 14px rgba(0,240,255,0.2)',
            }}
          >
            {ctaLabel.toUpperCase()}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="top-0 left-0 right-0 z-[70] flex items-center px-4 gap-3"
      style={{
        flexShrink: 0,
        position: 'relative',
        width: '100%',
        height: 32,
        background: 'rgba(4,6,10,0.98)',
        borderBottom: `1px solid ${securityMode ? 'rgba(255,42,75,0.2)' : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      {/* Scanning bar at top of bar */}
      <motion.div
        style={{
          position: 'absolute', top: 0, left: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`,
          width: '30%',
        }}
        animate={{ x: ['-30%', '130%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 6 }}
      />

      {/* ── EDITH Identity ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <motion.div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: securityMode ? '#FF2A4B' : '#00F0FF', boxShadow: `0 0 6px ${securityMode ? '#FF2A4B' : '#00F0FF'}` }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: securityMode ? '#FF2A4B' : '#00F0FF', letterSpacing: '0.1em' }}>
          EDITH 2.0
        </span>
        <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>
          {securityMode ? 'TACTICAL' : `${moduleCount} MOD ONLINE`}
        </span>
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Module dots ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {DEPARTMENTS.map((dept) => {
          const isActive = activeDepartment === dept.id;
          return (
            <motion.div
              key={dept.id}
              className="rounded-full"
              style={{
                width: isActive ? 6 : 4,
                height: isActive ? 6 : 4,
                background: isActive ? dept.color : dept.color + '45',
                boxShadow: isActive ? `0 0 6px ${dept.color}` : 'none',
              }}
              animate={isActive ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] } : { opacity: 0.4 }}
              transition={{ duration: 2, repeat: Infinity }}
              title={dept.label}
            />
          );
        })}
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── CPU mini-bar ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>CPU</span>
        <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: accentColor, transformOrigin: 'left' }}
            animate={{ width: `${cpuLoad}%` }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: accentColor + '90', minWidth: 24 }}>{cpuLoad}%</span>
      </div>

      {/* ── MEM mini-bar ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>MEM</span>
        <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: '#7B61FF', transformOrigin: 'left' }}
            animate={{ width: `${memLoad}%` }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: '#7B61FF90', minWidth: 24 }}>{memLoad}%</span>
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Uptime ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.06em' }}>UP</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.28)' }}>{formatUptime(uptime)}</span>
      </div>

      {/* ── Flex spacer ── */}
      <div className="flex-1" />

      {/* ── Stage badge ── */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded flex-shrink-0"
        style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}22` }}>
        <motion.div className="w-1 h-1 rounded-full" style={{ background: accentColor }}
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: accentColor, letterSpacing: '0.06em' }}>{stageLabel}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: accentColor + '60' }}>·</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: accentColor + '70', letterSpacing: '0.04em' }}>{stageDesc}</span>
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Orchestrator WS status ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <motion.div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: wsConnected ? '#2FD4A3' : '#FF2A4B',
            boxShadow: wsConnected ? '0 0 5px #2FD4A3' : '0 0 5px #FF2A4B88',
          }}
          animate={{ opacity: wsConnected ? [0.6, 1, 0.6] : [0.3, 0.7, 0.3] }}
          transition={{ duration: wsConnected ? 2 : 0.8, repeat: Infinity }}
        />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: wsConnected ? '#2FD4A3aa' : '#FF2A4Baa', letterSpacing: '0.05em' }}>
          {wsConnected ? `ORC·${activeSystem.toUpperCase()}` : 'ORC·OFFLINE'}
        </span>
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Ping ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.18)' }}>PING</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={ping}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: pingColor }}
          >
            {ping}ms
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Signal bars ── */}
      <div className="flex items-end gap-0.5 flex-shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{ width: 3, height: 4 + i * 2, background: i <= signalLevel ? '#2FD4A3' : 'rgba(255,255,255,0.1)' }}
            animate={i <= signalLevel ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.3 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Clock with ms ── */}
      <div className="flex items-baseline gap-0.5 flex-shrink-0">
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.04em' }}>{time}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.18)' }}>.{ms}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.18)', marginLeft: 2 }}>UTC</span>
      </div>
    </div>
  );
}
