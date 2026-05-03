"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  pruned: boolean;
}

interface ThinkingVisualizationProps {
  color?: string;
}

const PLANNING_STEPS = [
  { key: 'OBJECTIVE', label: 'Objective:', value: 'Parsing directive...' },
  { key: 'APPROACH', label: 'Approach:', value: 'Evaluating strategies...' },
  { key: 'TOOLCHAIN', label: 'Tool Chain:', value: 'Selecting modules...' },
  { key: 'RISKS', label: 'Risks:', value: 'Assessing constraints...' },
  { key: 'EXECUTION', label: 'Execution:', value: 'Initiating...' },
];

export function ThinkingVisualization({ color = '#00F0FF' }: ThinkingVisualizationProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 0, x: 120, y: 16, pruned: false },
  ]);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    // Reveal planning steps one by one
    const stepTimers: NodeJS.Timeout[] = [];
    PLANNING_STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleSteps(i + 1);
        if (i === PLANNING_STEPS.length - 1) {
          setTimeout(() => setComplete(true), 400);
        }
      }, 300 + i * 480);
      stepTimers.push(t);
    });

    // Add tree nodes
    const addInterval = setInterval(() => {
      setNodes((prev) => {
        if (prev.length >= 12) return prev;
        const parent = prev[Math.floor(Math.random() * Math.min(prev.length, 4))];
        return [
          ...prev,
          {
            id: prev.length,
            x: Math.max(20, Math.min(220, parent.x + (Math.random() - 0.5) * 70)),
            y: parent.y + 28 + Math.random() * 14,
            pruned: false,
          },
        ];
      });
    }, 320);

    // Prune some branches
    const pruneInterval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id > 2 && Math.random() > 0.6 ? { ...n, pruned: true } : n))
      );
    }, 1600);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearInterval(addInterval);
      clearInterval(pruneInterval);
    };
  }, []);

  const prunedColor = `${color}30`;

  return (
    <div className="flex items-start gap-5 py-2">
      {/* Left: Tree visualization */}
      <div className="flex-shrink-0">
        <svg width="240" height="145" className="overflow-visible">
          {nodes.map((node, i) => {
            if (i === 0) return null;
            const parent = nodes[i - 1];
            return (
              <motion.line
                key={`l-${node.id}`}
                x1={parent.x} y1={parent.y}
                x2={node.x} y2={node.y}
                stroke={node.pruned ? prunedColor : '#7B61FF'}
                strokeWidth={node.pruned ? 0.8 : 1.4}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: node.pruned ? 0.2 : 0.7 }}
                transition={{ duration: 0.22 }}
              />
            );
          })}
          {nodes.map((node) => (
            <motion.g key={node.id}>
              <motion.circle
                cx={node.x} cy={node.y}
                r={node.pruned ? 2 : 3.5}
                fill={node.pruned ? prunedColor : color}
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: node.pruned ? 0.2 : 1 }}
                transition={{ duration: 0.2 }}
              />
              {!node.pruned && (
                <motion.circle
                  cx={node.x} cy={node.y} r={6}
                  fill="none" stroke={color} strokeWidth={0.6}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              )}
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Right: Planning mode panel */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: color }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              color,
              letterSpacing: '0.08em',
            }}
          >
            EDITH PLANNING MODE
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-1.5">
          <AnimatePresence>
            {PLANNING_STEPS.slice(0, visibleSteps).map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="flex items-baseline gap-2"
              >
                <span
                  className="flex-shrink-0"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    color: color + 'aa',
                    minWidth: '74px',
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    color: i === visibleSteps - 1 && !complete ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
                    lineHeight: '1.5',
                  }}
                >
                  {step.value}
                  {/* Cursor blink on last active step */}
                  {i === visibleSteps - 1 && !complete && (
                    <motion.span
                      className="inline-block w-1 h-3 ml-1 rounded-sm"
                      style={{ background: color, verticalAlign: 'middle' }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    />
                  )}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Complete marker */}
          {complete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mt-2"
            >
              <div className="flex-1 h-px" style={{ background: `${color}30` }} />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                  color: color + '80',
                  letterSpacing: '0.1em',
                }}
              >
                EXECUTING
              </span>
              <div className="flex-1 h-px" style={{ background: `${color}30` }} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
