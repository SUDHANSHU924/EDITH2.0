// Commander profile and preferences panel
'use client';

import { motion } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';

interface CommanderProfileProps {
  name?: string;
  role?: string;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function CommanderProfile({
  name = 'Commander',
  role = 'Administrator',
  onSettings,
  onLogout,
}: CommanderProfileProps) {
  return (
    <div className="space-y-4">
      <div className="px-3 py-4 bg-muted/20 rounded-lg border border-edith-cyan/20">
        <div className="text-xs font-mono font-semibold text-edith-cyan mb-2">
          PROFILE
        </div>

        <div className="space-y-3">
          {/* User Info */}
          <div>
            <div className="text-sm font-semibold text-foreground">{name}</div>
            <div className="text-xs text-muted-foreground">{role}</div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-muted-foreground">Online</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-muted/30">
            <div>
              <div className="text-xs text-muted-foreground">Sessions</div>
              <div className="text-sm font-semibold text-edith-cyan">24</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Uptime</div>
              <div className="text-sm font-semibold text-edith-cyan">99.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <motion.button
          onClick={onSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-foreground hover:bg-muted/30 transition-colors"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={16} className="text-muted-foreground" />
          <span>Settings</span>
        </motion.button>

        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-red-400/80 hover:bg-red-400/10 transition-colors"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
