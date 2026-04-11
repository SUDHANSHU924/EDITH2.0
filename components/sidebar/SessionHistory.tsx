'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface Session {
  id: string;
  name: string;
  timestamp: string;
  messageCount: number;
}

interface SessionHistoryProps {
  sessions?: Session[];
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
}

const defaultSessions: Session[] = [
  { id: '1', name: 'Commander Briefing', timestamp: 'Today 2:45 PM', messageCount: 12 },
  { id: '2', name: 'Code Review Session', timestamp: 'Yesterday', messageCount: 28 },
  { id: '3', name: 'System Analysis', timestamp: '2 days ago', messageCount: 15 },
];

export function SessionHistory({
  sessions = defaultSessions,
  onSelectSession,
  onDeleteSession,
}: SessionHistoryProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-mono font-semibold text-muted-foreground px-2">
        RECENT SESSIONS
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            className="group px-3 py-2 rounded hover:bg-muted/30 transition-colors cursor-pointer"
            onClick={() => onSelectSession?.(session.id)}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">
                  {session.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.timestamp} • {session.messageCount} messages
                </div>
              </div>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession?.(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 size={14} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
