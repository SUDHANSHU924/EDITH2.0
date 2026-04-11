"use client";

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { DEPARTMENTS, type DepartmentId } from '../departments';

interface HudStatusBarProps {
  securityMode: boolean;
  activeDepartment: DepartmentId;
  autonomyStage: number;
  accentColor: string;
}

export function HudStatusBar({
  securityMode,
  activeDepartment,
  autonomyStage,
  accentColor,
}: HudStatusBarProps) {
  const [time, setTime] = useState('');
  const [tick, setTick] = useState(true);
  const moduleCount = DEPARTMENTS.length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setTick((t) => !t);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stageLabel = `STAGE ${autonomyStage}`;
  const stageDesc = ['DIRECTED', 'DELEGATED', 'PROACTIVE', 'MANAGED'][autonomyStage - 1];

  return (
    <div
      className="top-0 left-0 right-0 z-[70] h-8 flex items-center px-4 gap-4"
      style={{
        flexShrink: 0,
        position: 'relative',
        width: '100%',
        background: 'rgba(5,5,5,0.97)',
        borderBottom: `1px solid ${securityMode ? 'rgba(255,42,75,0.15)' : 'rgba(255,255,255,0.05)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: EDITH identity + online indicator */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <motion.div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: securityMode ? '#FF2A4B' : '#00F0FF' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: securityMode ? '#FF2A4B' : '#00F0FF',
            letterSpacing: '0.08em',
          }}
        >
          EDITH 2.0
        </span>
        <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.06em',
          }}
        >
          {securityMode ? 'TACTICAL' : `${moduleCount} MOD ONLINE`}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Module status dots */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {DEPARTMENTS.map((dept) => (
          <motion.div
            key={dept.id}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: activeDepartment === dept.id ? dept.color : dept.color + '50',
            }}
            animate={
              activeDepartment === dept.id
                ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                : { opacity: 0.4 }
            }
            transition={{ duration: 2, repeat: Infinity }}
            title={dept.label}
          />
        ))}
      </div>

      {/* Center spacer */}
      <div className="flex-1" />

      {/* Autonomy Stage */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded"
          style={{
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px',
              color: accentColor,
              letterSpacing: '0.06em',
            }}
          >
            {stageLabel}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px',
              color: accentColor + '70',
              letterSpacing: '0.04em',
            }}
          >
            {stageDesc}
          </span>
        </div>
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Commander clearance */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div
          className="w-1 h-1 rounded-full"
          style={{ background: '#2FD4A3' }}
        />
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.05em',
          }}
        >
          CMD: ALPHA
        </span>
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Connection quality dots */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: 3,
              height: 5 + i * 2,
              background: i <= 3 ? '#2FD4A3' : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>

      <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Time */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.04em',
          }}
        >
          {time}
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          UTC
        </span>
      </div>
    </div>
  );
}
