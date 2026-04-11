import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  ChevronRight, Upload,
  Wifi, WifiOff, CheckCircle2, Clock, AlertTriangle,
  Volume2, VolumeX, RefreshCw, Star, TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { DEPARTMENTS, type DepartmentId } from '../departments';

interface PeripherySidebarProps {
  securityMode: boolean;
  activeDepartment: DepartmentId;
}

interface SystemLog {
  id: number;
  type: 'SYS' | 'RAG' | 'THREAT' | 'INFO';
  message: string;
  timestamp: string;
}

// ── Individual Department Panels ──────────────────────────────────────────────

function CorePanel({ color }: { color: string }) {
  const stats = [
    { label: 'CONTEXT TURNS', value: '12', color },
    { label: 'TOKENS USED', value: '4,291', color },
    { label: 'LANG DETECT', value: 'EN-US', color },
    { label: 'CONFIDENCE', value: '99.4%', color },
  ];
  return (
    <PanelWrapper color={color} title="CONTEXT STATUS" badge="ONLINE">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-white/40 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>{s.label}</div>
            <div className="text-white text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {['Summarize this conversation', 'Translate last response', 'Explain in simple terms'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
      <div className="mt-4 p-3 rounded-xl" style={{ background: `${color}0c`, border: `1px solid ${color}25` }}>
        <div className="text-xs mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>CAPABILITIES</div>
        <div className="flex flex-wrap gap-1">
          {['NLU', 'Context', '50+ Langs', 'Tone Adapt', 'Summarize', 'Clarify'].map((cap) => (
            <span key={cap} className="px-2 py-0.5 rounded text-xs" style={{ background: `${color}15`, color, fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
              {cap}
            </span>
          ))}
        </div>
      </div>
    </PanelWrapper>
  );
}

function AgentPanel({ color }: { color: string }) {
  const [tasks] = useState([
    { id: 1, label: 'Research phase', status: 'idle' },
    { id: 2, label: 'Task decomposition', status: 'idle' },
    { id: 3, label: 'Code generation', status: 'idle' },
    { id: 4, label: 'Quality review', status: 'idle' },
  ]);
  return (
    <PanelWrapper color={color} title="AGENT ENGINE" badge="STANDING BY">
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>TASK QUEUE</div>
        <div className="space-y-1.5">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Clock size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
              <span className="text-xs text-white/50 flex-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{t.label}</span>
              <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>IDLE</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'REASONING', value: 'Tree-of-Thought' },
          { label: 'DEPTH', value: '5 levels' },
          { label: 'SUB-AGENTS', value: '0 active' },
          { label: 'REACT LOOPS', value: '0' },
        ].map((s) => (
          <div key={s.label} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-white/30 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>{s.label}</div>
            <div className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {['Plan this project', 'Decompose objective', 'Spawn sub-agents'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function CodePanel({ color }: { color: string }) {
  const [activeLang, setActiveLang] = useState('Python');
  const langs = ['Python', 'TypeScript', 'Rust', 'Go', 'SQL', 'Bash'];
  return (
    <PanelWrapper color={color} title="CODE FORGE" badge="READY">
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>ACTIVE LANGUAGE</div>
        <div className="flex flex-wrap gap-1.5">
          {langs.map((l) => (
            <button
              key={l}
              onClick={() => setActiveLang(l)}
              className="px-2.5 py-1 rounded-md text-xs transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: activeLang === l ? `${color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeLang === l ? color + '50' : 'rgba(255,255,255,0.08)'}`,
                color: activeLang === l ? color : 'rgba(255,255,255,0.4)',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>CODE QUALITY</div>
        {[
          { label: 'Security Score', val: 94, max: 100 },
          { label: 'Test Coverage', val: 87, max: 100 },
          { label: 'Performance', val: 91, max: 100 },
        ].map((m) => (
          <div key={m.label} className="mb-2">
            <div className="flex justify-between text-xs mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
              <span className="text-white/40">{m.label}</span>
              <span style={{ color }}>{m.val}%</span>
            </div>
            <div className="h-0.5 rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${m.val}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {['Review this code', 'Generate unit tests', 'Debug this error'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function FilesPanel({ color }: { color: string }) {
  const templates = [
    { ext: '.py', label: 'Python Script' },
    { ext: '.ts', label: 'TypeScript' },
    { ext: '.md', label: 'Markdown' },
    { ext: '.json', label: 'JSON Config' },
    { ext: '.yml', label: 'YAML / CI' },
    { ext: 'DOCK', label: 'Dockerfile' },
  ];
  return (
    <PanelWrapper color={color} title="FILE VAULT" badge="OPEN">
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>TEMPLATES</div>
        <div className="grid grid-cols-3 gap-1.5">
          {templates.map((t) => (
            <motion.button
              key={t.ext}
              className="p-2 rounded-lg flex flex-col items-center gap-1 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              whileHover={{ scale: 1.04, borderColor: color + '40' }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color, fontSize: '10px' }}>{t.ext}</span>
              <span className="text-white/40 leading-tight" style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px' }}>{t.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>EXPORT FORMATS</div>
        <div className="flex flex-wrap gap-1">
          {['.pdf', '.docx', '.pptx', '.xlsx', '.html', '.zip'].map((fmt) => (
            <span key={fmt} className="px-2 py-0.5 rounded text-xs" style={{ background: `${color}12`, color: color + 'cc', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
              {fmt}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {['Generate Dockerfile', 'Write a report', 'Create config file'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function SearchPanel({ color }: { color: string }) {
  const sources = [
    { label: 'Web Search', status: 'READY', ok: true },
    { label: 'ArXiv Papers', status: 'READY', ok: true },
    { label: 'News Feeds', status: 'READY', ok: true },
    { label: 'Price APIs', status: 'READY', ok: true },
  ];
  return (
    <PanelWrapper color={color} title="DEEP SEARCH" badge="LIVE">
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>DATA SOURCES</div>
        <div className="space-y-1.5">
          {sources.map((s) => (
            <div key={s.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CheckCircle2 size={11} style={{ color: s.ok ? '#2FD4A3' : '#FF2A4B' }} />
              <span className="text-white/60 flex-1 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{s.label}</span>
              <span className="text-xs" style={{ color: s.ok ? '#2FD4A3' : '#FF2A4B', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>CREDIBILITY FILTER</div>
        <div className="flex gap-1.5">
          {['ALL', 'HIGH', 'VERIFIED'].map((f) => (
            <button
              key={f}
              className="flex-1 py-1.5 rounded-lg text-xs transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                background: f === 'HIGH' ? `${color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${f === 'HIGH' ? color + '50' : 'rgba(255,255,255,0.08)'}`,
                color: f === 'HIGH' ? color : 'rgba(255,255,255,0.35)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {['Research a topic', 'Find latest papers', 'Competitive analysis'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function LearnPanel({ color }: { color: string }) {
  return (
    <PanelWrapper color={color} title="SELF-LEARN" badge="MONITORING">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'PATTERNS', value: '0' },
          { label: 'CORRECTIONS', value: '0' },
          { label: 'TECH SCOUTS', value: '4' },
          { label: 'KNOWLEDGE IDX', value: '1.2K' },
        ].map((s) => (
          <div key={s.label} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-white/30 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>{s.label}</div>
            <div className="text-xl" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>LEARNING SOURCES</div>
        <div className="space-y-1.5">
          {[
            { label: 'arXiv AI papers', icon: TrendingUp },
            { label: 'Hugging Face releases', icon: Star },
            { label: 'Commander corrections', icon: RefreshCw },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <Icon size={11} style={{ color: color + '90' }} />
                <span className="text-white/50 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-1.5">
        {['What patterns have you seen?', 'Scout new tech', 'Index this knowledge'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function DataPanel({ color }: { color: string }) {
  const chartData = [
    { name: 'RF', value: 94.2 },
    { name: 'XGB', value: 96.1 },
    { name: 'NN', value: 95.8 },
    { name: 'SVM', value: 88.4 },
    { name: 'LR', value: 82.1 },
  ];
  return (
    <PanelWrapper color={color} title="DATA LAB" badge="INITIALIZED">
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>MODEL BENCHMARK</div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={12}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a1428', border: `1px solid ${color}40`, borderRadius: 8, fontFamily: 'JetBrains Mono' }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                itemStyle={{ color, fontSize: 11 }}
                formatter={(v: number) => [`${v}%`, 'Accuracy']}
              />
              <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>FRAMEWORKS</div>
        <div className="flex flex-wrap gap-1">
          {['PyTorch', 'Scikit', 'TF', 'HuggingFace', 'Optuna', 'W&B'].map((fw) => (
            <span key={fw} className="px-2 py-0.5 rounded text-xs" style={{ background: `${color}12`, color: color + 'cc', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
              {fw}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {['Run EDA', 'Train classifier', 'Generate ML pipeline'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function IotPanel({ color }: { color: string }) {
  const [devices] = useState([
    { label: 'Living Room', type: 'lights', online: true },
    { label: 'Thermostat', type: 'temp', online: true },
    { label: 'Front Door', type: 'lock', online: true },
    { label: 'Garage', type: 'garage', online: false },
  ]);
  return (
    <PanelWrapper color={color} title="IoT CONTROL" badge="HUB ACTIVE">
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>DEVICE STATUS</div>
        <div className="space-y-1.5">
          {devices.map((d) => (
            <div key={d.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {d.online ? <Wifi size={11} style={{ color: '#2FD4A3' }} /> : <WifiOff size={11} style={{ color: '#FF2A4B' }} />}
              <span className="text-white/60 flex-1 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{d.label}</span>
              <span className="text-xs" style={{ color: d.online ? '#2FD4A3' : '#FF2A4B', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>
                {d.online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>SCENES</div>
        <div className="grid grid-cols-2 gap-1.5">
          {['Morning', 'Work Mode', 'Movie', 'Away'].map((scene) => (
            <motion.button
              key={scene}
              className="py-2 rounded-lg text-xs text-center"
              style={{ background: `${color}12`, border: `1px solid ${color}25`, color, fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
              whileHover={{ scale: 1.03, background: `${color}22` }}
              whileTap={{ scale: 0.97 }}
            >
              {scene}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-white/30 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>ENERGY TODAY</div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>4.2</span>
          <span className="text-white/40 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>kWh</span>
          <span className="text-xs ml-auto" style={{ color: '#2FD4A3', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>↓23%</span>
        </div>
      </div>
    </PanelWrapper>
  );
}

function VisionPanel({ color }: { color: string }) {
  return (
    <PanelWrapper color={color} title="VISION LENS" badge="READY">
      {/* Drop zone */}
      <div
        className="mb-4 rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer"
        style={{ background: `${color}08`, border: `2px dashed ${color}30` }}
      >
        <Upload size={22} style={{ color: color + '70' }} />
        <div className="mt-2 text-center">
          <div className="text-xs" style={{ color: color + '90', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>DROP IMAGE HERE</div>
          <div className="text-white/30 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>PNG · JPG · PDF · SVG</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>CAPABILITIES</div>
        <div className="space-y-1.5">
          {[
            { label: 'Image Analysis & Description', ready: true },
            { label: 'OCR Text Extraction', ready: true },
            { label: 'Diagram Interpretation', ready: true },
            { label: 'UI/UX Screenshot Review', ready: true },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <CheckCircle2 size={10} style={{ color: c.ready ? color : 'rgba(255,255,255,0.2)' }} />
              <span className="text-white/50 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {['Analyze an image', 'Extract text from image', 'Review this UI'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function VoicePanel({ color }: { color: string }) {
  const [listening, setListening] = useState(false);
  return (
    <PanelWrapper color={color} title="VOICE OPS" badge="ARMED">
      {/* Waveform */}
      <div
        className="mb-4 rounded-xl p-4 flex items-center justify-center gap-1"
        style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${color}25`, height: 72 }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 3, background: color + (listening ? 'cc' : '40') }}
            animate={{ height: listening ? [4, 8 + Math.random() * 28, 4] : [4, 6, 4] }}
            transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.05 }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'LANGUAGE', value: 'EN-US' },
          { label: 'LATENCY', value: '34ms' },
          { label: 'VOICE MODEL', value: 'Whisper' },
          { label: 'NOISE FILTER', value: 'ACTIVE' },
        ].map((s) => (
          <div key={s.label} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-white/30 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>{s.label}</div>
            <div className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <motion.button
        className="w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 mb-3"
        style={{
          background: listening ? `${color}25` : `${color}12`,
          border: `1px solid ${color}${listening ? '60' : '30'}`,
          color, fontFamily: 'JetBrains Mono, monospace',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setListening(!listening)}
      >
        {listening ? <VolumeX size={13} /> : <Volume2 size={13} />}
        {listening ? 'STOP LISTENING' : 'PUSH TO TALK'}
      </motion.button>
    </PanelWrapper>
  );
}

function PersonalPanel({ color }: { color: string }) {
  const [tone, setTone] = useState('Professional');
  const [depth, setDepth] = useState('Expert');
  return (
    <PanelWrapper color={color} title="PERSONALIZE" badge="CALIBRATING">
      <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}20` }}>
        <div className="text-white/30 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>COMMANDER PROFILE</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color }}>CMD</span>
          </div>
          <div>
            <div className="text-white text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>COMMANDER</div>
            <div className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color, fontSize: '10px' }}>CLEARANCE: ALPHA</div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>RESPONSE TONE</div>
        <div className="flex gap-1.5">
          {['Casual', 'Professional', 'Technical'].map((t) => (
            <button key={t} onClick={() => setTone(t)} className="flex-1 py-1.5 rounded-lg text-xs" style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
              background: tone === t ? `${color}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tone === t ? color + '50' : 'rgba(255,255,255,0.08)'}`,
              color: tone === t ? color : 'rgba(255,255,255,0.35)',
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>EXPERTISE LEVEL</div>
        <div className="flex gap-1.5">
          {['Beginner', 'Intermediate', 'Expert'].map((d) => (
            <button key={d} onClick={() => setDepth(d)} className="flex-1 py-1.5 rounded-lg text-xs" style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
              background: depth === d ? `${color}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${depth === d ? color + '50' : 'rgba(255,255,255,0.08)'}`,
              color: depth === d ? color : 'rgba(255,255,255,0.35)',
            }}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {['Update my preferences', 'Build my profile', 'Calibrate responses'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

function SecurityPanel({ color }: { color: string }) {
  return (
    <PanelWrapper color={color} title="SECURITY GRID" badge="ACTIVE">
      <div className="mb-4">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>VULNERABILITY HEATMAP</div>
        <div className="grid grid-cols-10 gap-0.5">
          {Array.from({ length: 80 }).map((_, i) => (
            <motion.div
              key={i}
              className="aspect-square rounded-sm"
              style={{ backgroundColor: `rgba(255,42,75,${Math.random() * 0.7 + 0.05})` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.008 }}
            />
          ))}
        </div>
        <motion.div
          className="text-center text-xs mt-2"
          style={{ fontFamily: 'JetBrains Mono, monospace', color, fontSize: '10px' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          SCANNING...
        </motion.div>
      </div>
      <div className="mb-4 space-y-1.5">
        <div className="text-white/30 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>THREAT FEED</div>
        {[
          { label: 'CVE-2024-1234', severity: 'CRITICAL', score: '9.8' },
          { label: 'CVE-2024-5678', severity: 'HIGH', score: '7.2' },
          { label: 'CVE-2024-9012', severity: 'MEDIUM', score: '4.3' },
        ].map((cve) => (
          <div key={cve.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,42,75,0.06)', border: '1px solid rgba(255,42,75,0.15)' }}>
            <AlertTriangle size={10} style={{ color: '#FF2A4B' }} />
            <span className="text-white/60 flex-1 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>{cve.label}</span>
            <span className="text-xs" style={{ color: '#FF2A4B', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>{cve.severity}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {['OWASP audit', 'Scan for CVEs', 'Generate threat model'].map((cmd) => (
          <QuickCmd key={cmd} label={cmd} color={color} />
        ))}
      </div>
    </PanelWrapper>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────

function PanelWrapper({ children, color, title, badge }: {
  children: React.ReactNode;
  color: string;
  title: string;
  badge: string;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color, fontSize: '11px' }}>
          {title}
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
            background: `${color}15`, color: color + 'cc',
            border: `1px solid ${color}30`,
          }}
        >
          {badge}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function QuickCmd({ label, color }: { label: string; color: string }) {
  return (
    <motion.button
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      whileHover={{ background: `${color}10`, borderColor: `${color}30`, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <ChevronRight size={11} style={{ color: color + '80', flexShrink: 0 }} />
      <span className="text-white/50 text-xs truncate" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
        {label}
      </span>
    </motion.button>
  );
}

// ── Main Sidebar Component ────────────────────────────────────────────────────

export function PeripherySidebar({ securityMode, activeDepartment }: PeripherySidebarProps) {
  const [logs, setLogs] = useState<SystemLog[]>([
    { id: 1, type: 'SYS', message: 'DeepSeek R1: Connected', timestamp: '14:23:01' },
    { id: 2, type: 'RAG', message: 'Indexing: Commander_Prefs.json', timestamp: '14:23:05' },
    { id: 3, type: 'THREAT', message: 'NIST CVE Update: 3 new entries', timestamp: '14:23:12' },
  ]);

  useEffect(() => {
    const logMessages = [
      ['SYS', 'Memory sync complete'],
      ['SYS', 'Processing request queue'],
      ['RAG', 'Neural pathways optimized'],
      ['RAG', 'Cache updated: 2.4GB'],
      ['THREAT', 'Security scan: All clear'],
      ['SYS', 'Context window: 87% full'],
      ['INFO', 'Model temperature: 0.72'],
    ] as [SystemLog['type'], string][];

    const interval = setInterval(() => {
      const [type, message] = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs((prev) => [
        { id: Date.now(), type, message, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) },
        ...prev,
      ].slice(0, 18));
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const currentDept = DEPARTMENTS.find((d) => d.id === activeDepartment)!;
  const accentColor = securityMode ? '#FF2A4B' : currentDept.color;

  const renderDepartmentPanel = () => {
    if (securityMode) return <SecurityPanel color="#FF2A4B" />;
    switch (activeDepartment) {
      case 'core':     return <CorePanel color={currentDept.color} />;
      case 'agent':    return <AgentPanel color={currentDept.color} />;
      case 'code':     return <CodePanel color={currentDept.color} />;
      case 'files':    return <FilesPanel color={currentDept.color} />;
      case 'search':   return <SearchPanel color={currentDept.color} />;
      case 'learn':    return <LearnPanel color={currentDept.color} />;
      case 'data':     return <DataPanel color={currentDept.color} />;
      case 'iot':      return <IotPanel color={currentDept.color} />;
      case 'vision':   return <VisionPanel color={currentDept.color} />;
      case 'voice':    return <VoicePanel color={currentDept.color} />;
      case 'personal': return <PersonalPanel color={currentDept.color} />;
      case 'security': return <SecurityPanel color={currentDept.color} />;
      default:         return <CorePanel color={currentDept.color} />;
    }
  };

  return (
    <div className="h-full w-80 flex flex-col">
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(8,12,20,0.96) 100%)',
          borderLeft: `1px solid ${accentColor}18`,
          backdropFilter: 'blur(20px)',
        }}
        animate={{ borderColor: `${accentColor}18` }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div>
            <div
              className="text-white text-xs"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              THE PERIPHERY
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: accentColor, fontSize: '10px' }}
            >
              {securityMode ? 'TACTICAL MODE' : currentDept.subtitle.toUpperCase()}
            </div>
          </div>
          <motion.div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25` }}
            animate={{ borderColor: [`${accentColor}20`, `${accentColor}40`, `${accentColor}20`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accentColor }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color: accentColor, fontSize: '10px' }}>
              {currentDept.moduleNum}
            </span>
          </motion.div>
        </div>

        {/* Department panel — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 periphery-scroll">
          <AnimatePresence mode="wait">
            <div key={activeDepartment + (securityMode ? '-sec' : '')}>
              {renderDepartmentPanel()}
            </div>
          </AnimatePresence>
        </div>

        {/* System Logs — pinned at bottom */}
        <div className="flex-shrink-0 border-t border-white/5">
          <div className="px-5 py-3">
            <div className="text-white/25 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', letterSpacing: '0.1em' }}>
              SYSTEM LOGS
            </div>
            <div className="space-y-1.5 overflow-hidden" style={{ maxHeight: 130 }}>
              {logs.slice(0, 4).map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-start gap-2"
                >
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                      color: log.type === 'SYS' ? '#00F0FF' : log.type === 'RAG' ? '#7B61FF' : log.type === 'THREAT' ? '#FF2A4B' : '#F5A623',
                      flexShrink: 0,
                    }}
                  >
                    [{log.type}]
                  </span>
                  <span className="text-white/40 text-xs truncate flex-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                    {log.message}
                  </span>
                  <span className="text-white/20 flex-shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>
                    {log.timestamp}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .periphery-scroll::-webkit-scrollbar { width: 2px; }
        .periphery-scroll::-webkit-scrollbar-track { background: transparent; }
        .periphery-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 1px; }
      `}</style>
    </div>
  );
}