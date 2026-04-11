'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Home, Code, Search, FileText, Shield, Satellite, Menu } from 'lucide-react';
import { SessionHistory } from './SessionHistory';
import { CommanderProfile } from './CommanderProfile';

interface NavItem {
  icon: LucideIcon;
  label: string;
  id: string;
  color?: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Commander', id: 'commander', color: '#00F0FF' },
  { icon: Code, label: 'Code', id: 'code', color: '#7B61FF' },
  { icon: Search, label: 'Search', id: 'search', color: '#00F0FF' },
  { icon: FileText, label: 'Files', id: 'files', color: '#00D9FF' },
  { icon: Shield, label: 'Security', id: 'security', color: '#FF2A4B' },
  { icon: Satellite, label: 'Satellite', id: 'satellite', color: '#00F0FF' },
];

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export function Sidebar({ activeItem = 'commander', onItemClick }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="h-screen bg-sidebar-gradient backdrop-blur-xl border-r border-sidebar-border flex flex-col overflow-hidden"
      initial={false}
      animate={{ width: isExpanded ? '272px' : '72px' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(8,12,20,0.96) 100%)',
      }}
    >
      {/* Logo section */}
      <div className="flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0">
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.3), rgba(123,97,255,0.2))',
            border: '1px solid rgba(0,240,255,0.4)',
          }}
          animate={{
            boxShadow: [
              '0 0 8px rgba(0,240,255,0.2)',
              '0 0 16px rgba(0,240,255,0.4)',
              '0 0 8px rgba(0,240,255,0.2)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#00F0FF' }}>A2</span>
        </motion.div>

        {isExpanded && (
          <motion.div
            className="ml-3 overflow-hidden"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex flex-col">
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#FFFFFF', fontWeight: 'bold' }}>AURA 2.0</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#00F0FF' }}>COMMAND BRIDGE</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation items */}
        <nav className="py-4 space-y-2 px-2 border-b border-sidebar-border/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-sidebar-accent border border-cyan-500/40'
                      : 'hover:bg-sidebar-accent/50 border border-transparent'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-shrink-0">
                  <Icon
                    size={20}
                    style={{
                      color: isActive ? (item.color || '#00F0FF') : '#A0A0A8',
                    }}
                  />
                </div>

                {isExpanded && (
                  <span
                    className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                      color: isActive ? (item.color || '#00F0FF') : '#F5F5F5',
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {isActive && isExpanded && (
                  <motion.div
                    className="ml-auto w-1 h-4 rounded-full"
                    style={{
                      background: item.color || '#00F0FF',
                      boxShadow: `0 0 8px ${item.color || '#00F0FF'}`,
                    }}
                    layoutId="activeIndicator"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Expandable sections */}
        {isExpanded && (
          <motion.div
            className="px-2 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <SessionHistory />
            <CommanderProfile />
          </motion.div>
        )}
      </div>

      {/* Footer section */}
      <div className="border-t border-sidebar-border p-4 flex-shrink-0">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Menu"
        >
          <Menu size={20} />
          {isExpanded && <span className="text-sm">More</span>}
        </button>
      </div>
    </motion.div>
  );
}
