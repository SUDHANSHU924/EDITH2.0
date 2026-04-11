'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';

export default function CommanderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSystem, setActiveSystem] = useState('commander');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeItem={activeSystem} onItemClick={setActiveSystem} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
