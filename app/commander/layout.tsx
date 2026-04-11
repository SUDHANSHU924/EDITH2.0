'use client';

import { useState } from 'react';
import { TopBar } from '@/components/chat/TopBar';
import { Periphery } from '@/components/sidebar/Periphery';

interface CommanderLayoutProps {
  children: React.ReactNode;
}

export default function CommanderLayout({ children }: CommanderLayoutProps) {
  const [activeModule, setActiveModule] = useState(1);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="w-screen h-screen flex flex-col bg-void overflow-hidden">
      {/* TOP BAR */}
      <TopBar activeModule={activeModule} onModuleChange={setActiveModule} />

      {/* THREE-PANEL LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* ORBIT SIDEBAR - Will be added by wrapper */}

        {/* HORIZON - Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>

        {/* PERIPHERY - Right Panel */}
        <Periphery
          contextTurns={12}
          tokensUsed={4291}
          langDetect="EN-US"
          confidence="99.4%"
          cpuUsage={32}
          memUsage={61}
          threatLevel="GREEN"
        />
      </div>
    </div>
  );
}
