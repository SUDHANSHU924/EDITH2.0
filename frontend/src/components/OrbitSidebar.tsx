import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEPARTMENTS, type DepartmentId } from '../departments';

interface OrbitSidebarProps {
  securityMode: boolean;
  onSecurityToggle: () => void;
  activeDepartment: DepartmentId;
  onDepartmentChange: (id: DepartmentId) => void;
}

export function OrbitSidebar({
  securityMode,
  onSecurityToggle,
  activeDepartment,
  onDepartmentChange,
}: OrbitSidebarProps) {
  const [expanded, setExpanded] = useState(false);

  const handleModuleClick = (deptId: DepartmentId, isSecurity?: boolean) => {
    onDepartmentChange(deptId);
    if (isSecurity) {
      onSecurityToggle();
    }
  };

  return (
    <motion.div
      className="h-full z-10"
      initial={false}
      animate={{ width: expanded ? 272 : 72 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{ overflow: 'hidden' }}
    >
      <div
        className="h-full flex flex-col w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(8,12,20,0.96) 100%)',
          borderRight: `1px solid ${securityMode ? 'rgba(255,42,75,0.15)' : 'rgba(255,255,255,0.05)'}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo area */}
        <div className="flex items-center h-16 px-4 flex-shrink-0 border-b border-white/5">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: securityMode
                ? 'linear-gradient(135deg, rgba(255,42,75,0.3), rgba(255,42,75,0.1))'
                : 'linear-gradient(135deg, rgba(0,240,255,0.3), rgba(123,97,255,0.2))',
              border: `1px solid ${securityMode ? 'rgba(255,42,75,0.4)' : 'rgba(0,240,255,0.4)'}`,
            }}
            animate={{
              boxShadow: securityMode
                ? ['0 0 8px rgba(255,42,75,0.3)', '0 0 16px rgba(255,42,75,0.5)', '0 0 8px rgba(255,42,75,0.3)']
                : ['0 0 8px rgba(0,240,255,0.2)', '0 0 16px rgba(0,240,255,0.4)', '0 0 8px rgba(0,240,255,0.2)'],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                color: securityMode ? '#FF2A4B' : '#00F0FF',
              }}
            >
              A2
            </span>
          </motion.div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="ml-3 overflow-hidden"
              >
                <div
                  className="text-white text-sm"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  AURA 2.0
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: securityMode ? '#FF2A4B' : '#00F0FF',
                    fontSize: '10px',
                  }}
                >
                  {securityMode ? 'TACTICAL ACTIVE' : 'COMMAND BRIDGE'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Commander badge */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-3 mt-3 mb-2 rounded-xl overflow-hidden flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(123,97,255,0.25))',
                    border: '1px solid rgba(0,240,255,0.3)',
                  }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#00F0FF' }}>CMD</span>
                </div>
                <div>
                  <div className="text-white text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    COMMANDER
                  </div>
                  <div
                    className="text-xs"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00F0FF', fontSize: '10px' }}
                  >
                    CLEARANCE: ALPHA
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section label */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 mb-1 flex-shrink-0"
            >
              <span
                className="text-white/25"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', letterSpacing: '0.12em' }}
              >
                COMMAND MODULES
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Department modules — scrollable */}
        <div className="flex-1 overflow-y-auto px-2 py-1 orbit-scroll">
          <div className="space-y-0.5">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const isActive = activeDepartment === dept.id;
              const isSecurityDept = dept.isSecurity;
              const deptColor = isSecurityDept && securityMode ? '#FF2A4B' : dept.color;

              return (
                <motion.button
                  key={dept.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group"
                  style={{
                    background: isActive
                      ? `${deptColor}14`
                      : 'transparent',
                    border: `1px solid ${isActive ? deptColor + '35' : 'transparent'}`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleModuleClick(dept.id, dept.isSecurity)}
                >
                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                    style={{
                      background: `radial-gradient(ellipse at left center, ${deptColor}12, transparent 70%)`,
                    }}
                  />

                  {/* Active left bar */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                      style={{ background: deptColor }}
                      layoutId="activeBar"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    className="relative z-10 flex-shrink-0 w-6 h-6 flex items-center justify-center"
                    animate={{
                      filter: isActive
                        ? `drop-shadow(0 0 6px ${deptColor})`
                        : 'none',
                    }}
                  >
                    <Icon
                      size={18}
                      style={{
                        color: isActive ? deptColor : 'rgba(255,255,255,0.35)',
                        transition: 'color 0.2s',
                      }}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </motion.div>

                  {/* Online pulse for core */}
                  {dept.id === 'core' && (
                    <motion.div
                      className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full z-10"
                      style={{ backgroundColor: deptColor }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Label (when expanded) */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.12 }}
                        className="flex-1 min-w-0 relative z-10 text-left"
                      >
                        <div
                          className="text-xs leading-tight"
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            color: isActive ? deptColor : 'rgba(255,255,255,0.6)',
                          }}
                        >
                          {dept.label}
                        </div>
                        <div
                          className="text-xs leading-tight mt-0.5"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px',
                            color: isActive ? deptColor + 'aa' : 'rgba(255,255,255,0.25)',
                          }}
                        >
                          {dept.subtitle}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Module number (when expanded) */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs flex-shrink-0 relative z-10"
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: isActive ? deptColor + '80' : 'rgba(255,255,255,0.12)',
                          fontSize: '10px',
                        }}
                      >
                        {dept.moduleNum}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* System Vitals footer */}
        <div
          className="flex-shrink-0 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <AnimatePresence>
            {expanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-2.5"
              >
                {/* CPU */}
                <div>
                  <div
                    className="flex justify-between text-xs mb-1"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    <span className="text-white/30" style={{ fontSize: '10px' }}>CPU</span>
                    <span style={{ color: '#00F0FF', fontSize: '10px' }}>32%</span>
                  </div>
                  <div className="h-0.5 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#00F0FF' }}
                      initial={{ width: 0 }}
                      animate={{ width: '32%' }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Memory */}
                <div>
                  <div
                    className="flex justify-between text-xs mb-1"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    <span className="text-white/30" style={{ fontSize: '10px' }}>MEM</span>
                    <span style={{ color: '#7B61FF', fontSize: '10px' }}>61%</span>
                  </div>
                  <div className="h-0.5 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#7B61FF' }}
                      initial={{ width: 0 }}
                      animate={{ width: '61%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                    />
                  </div>
                </div>

                {/* Threat level */}
                <div
                  className="flex justify-between items-center text-xs"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
                >
                  <span className="text-white/30">THREAT</span>
                  <span
                    style={{ color: securityMode ? '#F5A623' : '#2FD4A3' }}
                    className="flex items-center gap-1"
                  >
                    <motion.span
                      className="inline-block w-1 h-1 rounded-full"
                      style={{ background: securityMode ? '#F5A623' : '#2FD4A3' }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {securityMode ? 'AMBER' : 'GREEN'}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 flex flex-col items-center gap-2"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: securityMode ? '#F5A623' : '#2FD4A3' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .orbit-scroll::-webkit-scrollbar { width: 2px; }
        .orbit-scroll::-webkit-scrollbar-track { background: transparent; }
        .orbit-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 1px; }
      `}</style>
    </motion.div>
  );
}