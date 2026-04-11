'use client';

export interface PeripheryProps {
  contextTurns?: number;
  tokensUsed?: number;
  langDetect?: string;
  confidence?: string;
  cpuUsage?: number;
  memUsage?: number;
  threatLevel?: 'GREEN' | 'YELLOW' | 'RED';
  systemLogs?: Array<{ type: 'THREAT' | 'INFO' | 'SYS'; msg: string; time: string }>;
}

const defaultLogs = [
  { type: 'THREAT' as const, msg: 'Security scan: All clear', time: '11:40:11' },
  { type: 'INFO' as const, msg: 'Model temperature: 0.72', time: '11:40:07' },
  { type: 'SYS' as const, msg: 'Processing request queue', time: '11:40:03' },
  { type: 'SYS' as const, msg: 'Context window: 87% full', time: '11:39:58' },
  { type: 'INFO' as const, msg: 'BGE-M3 embeddings indexed', time: '11:39:45' },
];

export function Periphery({
  contextTurns = 12,
  tokensUsed = 4291,
  langDetect = 'EN-US',
  confidence = '99.4%',
  cpuUsage = 32,
  memUsage = 61,
  threatLevel = 'GREEN',
  systemLogs = defaultLogs,
}: PeripheryProps) {
  const getLogColor = (type: string) => {
    switch (type) {
      case 'THREAT':
        return 'text-red';
      case 'INFO':
        return 'text-text-secondary';
      case 'SYS':
        return 'text-cyan/60';
      default:
        return 'text-text-secondary';
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'RED':
        return 'text-red';
      case 'YELLOW':
        return 'text-yellow-400';
      case 'GREEN':
      default:
        return 'text-status-green';
    }
  };

  return (
    <div className="w-80 h-full glass-panel flex flex-col border-l border-cyan-glow overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-cyan-glow">
        <div className="text-9px font-mono uppercase text-text-secondary tracking-widest">
          The Periphery
        </div>
        <div className="text-11px text-text-tertiary mt-1">
          Module 01 · Context Intelligence
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Context Status Section */}
        <div>
          <div className="text-9px font-mono uppercase text-cyan tracking-widest mb-3">
            Context Status
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Context Turns */}
            <div className="bg-cyan/5 border border-cyan/10 rounded-md p-2 text-center">
              <div className="text-9px font-mono text-text-tertiary uppercase">
                Context Turns
              </div>
              <div className="text-18px font-mono font-bold text-cyan mt-1">
                {contextTurns}
              </div>
            </div>

            {/* Tokens Used */}
            <div className="bg-cyan/5 border border-cyan/10 rounded-md p-2 text-center">
              <div className="text-9px font-mono text-text-tertiary uppercase">
                Tokens Used
              </div>
              <div className="text-18px font-mono font-bold text-cyan mt-1">
                {tokensUsed}
              </div>
            </div>

            {/* Lang Detect */}
            <div className="bg-cyan/5 border border-cyan/10 rounded-md p-2 text-center">
              <div className="text-9px font-mono text-text-tertiary uppercase">
                Lang Detect
              </div>
              <div className="text-14px font-mono font-bold text-white mt-1">
                {langDetect}
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-cyan/5 border border-cyan/10 rounded-md p-2 text-center">
              <div className="text-9px font-mono text-text-tertiary uppercase">
                Confidence
              </div>
              <div className="text-14px font-mono font-bold text-cyan mt-1">
                {confidence}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div>
          <div className="text-9px font-mono uppercase text-cyan tracking-widest mb-2">
            Quick Actions
          </div>
          <div className="space-y-1.5">
            {[
              'Summarize this conversation',
              'Translate last response',
              'Explain in simple terms',
            ].map((action) => (
              <button
                key={action}
                className="w-full text-left px-2 py-1.5 bg-transparent border border-cyan/10 rounded text-11px text-text-secondary hover:border-cyan hover:text-white transition-all"
              >
                <span className="text-cyan mr-1">{'>'}</span>
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Capabilities Section */}
        <div>
          <div className="text-9px font-mono uppercase text-cyan tracking-widest mb-2">
            Capabilities
          </div>
          <div className="flex flex-wrap gap-1">
            {['NLU', 'Context', '50+ Langs', 'Tone Adapt', 'Summarize', 'Clarify'].map(
              (cap) => (
                <div
                  key={cap}
                  className="px-2 py-0.5 bg-cyan/10 border border-cyan/20 rounded text-9px font-mono text-cyan"
                >
                  {cap}
                </div>
              )
            )}
          </div>
        </div>

        {/* System Logs Section */}
        <div>
          <div className="text-9px font-mono uppercase text-cyan tracking-widest mb-2">
            System Logs
          </div>
          <div className="max-h-40 overflow-y-auto bg-black/40 border border-cyan/10 rounded p-2 space-y-0.5">
            {systemLogs.map((log, idx) => (
              <div
                key={idx}
                className={`text-9px font-mono leading-tight ${getLogColor(log.type)}`}
              >
                <span className="font-bold">[{log.type}]</span> {log.msg}{' '}
                <span className="text-text-tertiary">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Monitor */}
        <div>
          <div className="space-y-2">
            {/* CPU */}
            <div>
              <div className="flex justify-between text-9px font-mono text-text-secondary mb-1">
                <span>CPU</span>
                <span className="text-cyan">{cpuUsage}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-cyan/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan to-blue-500"
                  style={{ width: `${cpuUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex justify-between text-9px font-mono text-text-secondary mb-1">
                <span>MEM</span>
                <span className="text-violet">{memUsage}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-cyan/10">
                <div
                  className="h-full bg-gradient-to-r from-violet to-blue-400"
                  style={{ width: `${memUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Threat Level */}
            <div>
              <div className="flex justify-between text-9px font-mono text-text-secondary">
                <span>THREAT</span>
                <span className={getThreatColor(threatLevel)}>▲ {threatLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
