'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export interface TaskPhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
}

interface TaskLogProps {
  phases: TaskPhase[];
  title?: string;
}

export function TaskLog({
  phases = [],
  title = 'Task Progress',
}: TaskLogProps) {
  if (phases.length === 0) return null;

  return (
    <motion.div
      className="my-4 px-4 py-3 rounded-lg border border-blue-500/20 bg-blue-500/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="text-sm font-semibold text-blue-400 mb-3 font-mono">{title}</h4>

      <div className="space-y-3">
        {phases.map((phase, idx) => (
          <div key={phase.id} className="space-y-1">
            {/* Phase header */}
            <div className="flex items-center gap-2">
              {phase.status === 'completed' && (
                <CheckCircle2 size={16} className="text-green-400" />
              )}
              {phase.status === 'running' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Clock size={16} className="text-cyan-400" />
                </motion.div>
              )}
              {phase.status === 'pending' && (
                <Clock size={16} className="text-muted-foreground" />
              )}
              {phase.status === 'error' && (
                <AlertCircle size={16} className="text-red-400" />
              )}

              <span
                className="text-xs font-mono font-semibold"
                style={{
                  color:
                    phase.status === 'completed'
                      ? '#22C55E'
                      : phase.status === 'running'
                        ? '#00F0FF'
                        : phase.status === 'error'
                          ? '#EF4444'
                          : '#A0A0A8',
                }}
              >
                {phase.name}
              </span>

              <span className="text-xs text-muted-foreground ml-auto">
                {phase.status.toUpperCase()}
              </span>
            </div>

            {/* Progress bar */}
            {phase.status === 'running' && phase.progress !== undefined && (
              <div className="h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  animate={{ width: `${phase.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
