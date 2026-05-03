import {
  Cpu, Code2, GitBranch, Globe, BarChart3, Eye,
  FolderOpen, Shield, Mic, Sliders, Wifi, Zap,
  Calendar, Bug, Satellite,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DepartmentId =
  | 'core' | 'code' | 'planning' | 'search'
  | 'ml' | 'vision' | 'files' | 'security'
  | 'voice' | 'personal' | 'iot' | 'learning'
  | 'daily' | 'security_grid' | 'satellite';

export interface Department {
  id: DepartmentId;
  label: string;
  shortLabel: string;
  subtitle: string;
  color: string;
  moduleNum: string;
  icon: LucideIcon;
  isSecurity?: boolean;
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'core',
    label: 'EDITH CORE',
    shortLabel: 'CORE',
    subtitle: 'Conversational AI',
    color: '#00F0FF',
    moduleNum: '01',
    icon: Cpu,
  },
  {
    id: 'planning',
    label: 'AGENT HUB',
    shortLabel: 'AGENT',
    subtitle: 'Agentic Reasoning',
    color: '#7B61FF',
    moduleNum: '02',
    icon: GitBranch,
  },
  {
    id: 'code',
    label: 'CODE FORGE',
    shortLabel: 'CODE',
    subtitle: 'Code Engineering',
    color: '#2FD4A3',
    moduleNum: '03',
    icon: Code2,
  },
  {
    id: 'files',
    label: 'FILE VAULT',
    shortLabel: 'FILES',
    subtitle: 'Document Engineering',
    color: '#F5A623',
    moduleNum: '04',
    icon: FolderOpen,
  },
  {
    id: 'search',
    label: 'DEEP SEARCH',
    shortLabel: 'SEARCH',
    subtitle: 'Research & Intel',
    color: '#4F8EF7',
    moduleNum: '05',
    icon: Globe,
  },
  {
    id: 'learning',
    label: 'SELF-LEARN',
    shortLabel: 'LEARN',
    subtitle: 'Knowledge Engine',
    color: '#56CFE1',
    moduleNum: '06',
    icon: Zap,
  },
  {
    id: 'ml',
    label: 'DATA LAB',
    shortLabel: 'DATA',
    subtitle: 'Data Science & ML',
    color: '#00E5BE',
    moduleNum: '07',
    icon: BarChart3,
  },
  {
    id: 'iot',
    label: 'IoT CONTROL',
    shortLabel: 'IoT',
    subtitle: 'Smart Home & Devices',
    color: '#FFB347',
    moduleNum: '08',
    icon: Wifi,
  },
  {
    id: 'vision',
    label: 'VISION LENS',
    shortLabel: 'VISION',
    subtitle: 'Vision & Multimodal',
    color: '#9B7BFF',
    moduleNum: '09',
    icon: Eye,
  },
  {
    id: 'voice',
    label: 'VOICE OPS',
    shortLabel: 'VOICE',
    subtitle: 'Voice Interface',
    color: '#FF6B6B',
    moduleNum: '10',
    icon: Mic,
  },
  {
    id: 'personal',
    label: 'PERSONALIZE',
    shortLabel: 'PERSONA',
    subtitle: 'Personalization Engine',
    color: '#C862F5',
    moduleNum: '11',
    icon: Sliders,
  },
  {
    id: 'security',
    label: 'SECURITY GRID',
    shortLabel: 'SEC',
    subtitle: 'Ethical Hacker Mode',
    color: '#FF2A4B',
    moduleNum: '12',
    icon: Shield,
    isSecurity: true,
  },
  {
    id: 'daily',
    label: 'DAILY OPS',
    shortLabel: 'DAILY',
    subtitle: 'Everyday Assistant',
    color: '#FFD166',
    moduleNum: '13',
    icon: Calendar,
  },
  {
    id: 'security_grid',
    label: 'HACKER GRID',
    shortLabel: 'HACK',
    subtitle: 'Offensive Security',
    color: '#FF6B6B',
    moduleNum: '14',
    icon: Bug,
  },
  {
    id: 'satellite',
    label: 'SATELLITE INTEL',
    shortLabel: 'SAT',
    subtitle: 'Orbital Systems',
    color: '#4CC9F0',
    moduleNum: '15',
    icon: Satellite,
  },
];

export const DEPARTMENT_WELCOMES: Record<DepartmentId, string> = {
  core: 'EDITH CORE active. Conversational intelligence fully engaged. Multi-turn context retention online. Natural language understanding at 99.4% fidelity. How may I serve, Commander?',
  planning: 'AGENT HUB engaged. Autonomous planning engine initialized. Tree-of-Thought reasoning active. ReAct loop standing by. Ready to decompose and execute any complex objective.',
  code: 'CODE FORGE online. Full-stack engineering suite loaded. Python 3.11, TypeScript, Rust, Go, and 15+ languages ready. Security code review active. What shall we build?',
  files: 'FILE VAULT open. Document engineering suite loaded. 12 file format templates on standby — source code, reports, configs, Dockerfiles. What shall I create?',
  search: 'DEEP SEARCH active. Real-time web intelligence online. Multi-source synthesis ready. Source credibility filter set to HIGH. What intelligence do you require?',
  learning: 'SELF-LEARN engine activated. Knowledge indexing in progress. Pattern recognition online. Technology scouting initiated. Monitoring for corrections and updates.',
  ml: 'DATA LAB initialized. ML pipeline frameworks loaded. PyTorch, Scikit-learn, Hugging Face TRL standing by. EDA, model training, and deployment pipelines ready.',
  iot: 'IoT CONTROL hub connected. Smart home protocols loaded. Zigbee, Z-Wave, Matter, MQTT support active. 0 devices detected — connect your network to begin.',
  vision: 'VISION LENS powered up. Multimodal analysis engine online. OCR, diagram interpretation, chart reading, and image analysis ready. Submit your visual data.',
  voice: 'VOICE OPS online. ASR and TTS engines primed. Whisper multilingual model loaded. Wake-word detection armed. Push-to-talk latency: 34ms. Ready.',
  personal: 'PERSONALIZATION ENGINE engaged. Commander profile analysis running. Adaptive response calibration active. Expertise level: detecting. Preference modeling initialized.',
  security: 'SECURITY GRID primed. Ethical hacker protocols loaded. OWASP Top 10 scanner active. CVE database synced. Vulnerability analysis ready. Awaiting your security directive.',
  daily: 'DAILY OPS online. Scheduling, summaries, and routines ready. What should I handle first?',
  security_grid: 'HACKER GRID online. Authorized testing only. Provide scope, target, and approval.',
  satellite: 'SATELLITE INTEL online. Tracking, imagery, and telemetry tools ready. Provide target and timeframe.',
};

export const DEPARTMENT_COMMANDS: Record<DepartmentId, string[]> = {
  core: ['Summarize our conversation', 'Translate to Spanish', 'Clarify this concept', 'Ask me a question'],
  planning: ['Plan a project for me', 'Decompose into tasks', 'Execute autonomously', 'Spawn sub-agents'],
  code: ['Review this code', 'Debug this error', 'Generate unit tests', 'Write a REST API'],
  files: ['Create a Python script', 'Generate a Dockerfile', 'Write a config file', 'Build a markdown report'],
  search: ['Research this topic', 'Find latest AI papers', 'Compare these options', 'Verify this claim'],
  learning: ['What patterns have you noticed?', 'Scout new technologies', 'Index this knowledge', 'Review my corrections'],
  ml: ['Run EDA on my dataset', 'Train a classifier', 'Generate ML pipeline', 'Visualize this data'],
  iot: ['Control my devices', 'Create automation routine', 'Check device status', 'Generate Home Assistant YAML'],
  vision: ['Analyze this image', 'Extract text from image', 'Interpret this diagram', 'Review this UI screenshot'],
  voice: ['Configure voice settings', 'Test TTS output', 'Set wake word', 'Enable push-to-talk'],
  personal: ['Update my preferences', 'Calibrate expertise level', 'Set response style', 'Build my Commander profile'],
  security: ['Scan for vulnerabilities', 'Pen test this endpoint', 'OWASP audit', 'Generate threat model'],
  daily: ['Build today\'s plan', 'Check weather', 'Summarize my tasks', 'Draft a daily report'],
  security_grid: ['Run vulnerability scan', 'CVE lookup', 'OSINT sweep', 'Generate pentest report'],
  satellite: ['Track a satellite', 'Predict pass window', 'Fetch imagery', 'Analyze orbital data'],
};

export const AI_RESPONSES: Record<DepartmentId, string[]> = {
  core: [
    'Analysis complete. Context retained across all prior directives. The optimal response synthesizes multiple knowledge domains for maximum precision. Shall I elaborate on any vector?',
    'Command acknowledged. Natural language processing complete. Semantic intent parsed at 99.4% confidence. Multi-turn context active — I recall everything from this session.',
    'Directive received and processed. I have cross-referenced this against 14,000+ data points. Confidence level: 97.3%. Three actionable pathways identified. Awaiting your authorization.',
    'Understood, Commander. I have indexed all relevant knowledge domains and synthesized a comprehensive action plan. Ambiguity resolved. Standing by for your next instruction.',
  ],
  planning: [
    'Objective decomposed into 4 subtasks. Parallel execution initiated:\n→ [T1] Research phase: 2 min\n→ [T2] Analysis & synthesis: 3 min\n→ [T3] Quality review: 1 min\n→ [T4] Final delivery: 30 sec\n\nTree-of-Thought: 7 branches evaluated, optimal path selected. No blockers detected.',
    'Multi-agent delegation complete. Research sub-agent returned 12 verified sources. Code sub-agent generated 3 implementation options. Synthesis agent ranked them by efficiency. Presenting optimal output.',
    'ReAct loop iteration 3 of 5 complete. Current confidence: 82%. Two additional reasoning cycles required for full certainty. Proceeding autonomously — will surface results when confidence exceeds 95%.',
    'Task plan generated. Self-critique pass complete — 2 improvements identified and applied before delivery. All subtasks marked COMPLETE. No escalation required.',
  ],
  code: [
    '```python\n# Optimized O(n log n) implementation\ndef solution(data: list[int]) -> list[int]:\n    """Zero-allocation merge sort variant.\n    Time: O(n log n) | Space: O(n)\n    """\n    if len(data) <= 1:\n        return data\n    mid = len(data) // 2\n    return merge(solution(data[:mid]), solution(data[mid:]))\n```\n\nCode review complete. 0 vulnerabilities detected. Cyclomatic complexity: 4 (excellent). Test coverage target: 94%.',
    'Architecture designed. FastAPI backend (12 endpoints, JWT auth, rate limiting), React frontend (TypeScript, Tailwind), PostgreSQL schema (normalized, indexed), Docker + GitHub Actions CI/CD. Production-ready.',
    'Bug isolated. Root cause: race condition in async handler — two coroutines mutating shared state without lock. Fix applied with asyncio.Lock(). Performance improved 340ms → 12ms. Unit test added for regression prevention.',
    'Security audit complete. OWASP scan results:\n→ [FIXED] SQL injection: 2 vectors — parameterized queries applied\n→ [FIXED] Missing CSRF tokens on 3 POST endpoints\n→ [FIXED] Insecure Content-Security-Policy headers\nAll 3 issues remediated. Code is now security-hardened.',
  ],
  files: [
    'File generated: `api_service.py` — FastAPI application with 12 endpoints, OpenAPI docs, OAuth2 authentication, rate limiting middleware, and structured logging. Ready for deployment.',
    'Report compiled: 8-page Markdown document with executive summary, technical analysis, data tables, and 5 actionable recommendations. PDF export available. Word version on standby.',
    'Infrastructure package created:\n→ `Dockerfile` — multi-stage build, non-root user, health check\n→ `docker-compose.yml` — 4 services with secrets management\n→ `.github/workflows/ci.yml` — lint, test, build, push\n→ `nginx.conf` — SSL, gzip, rate limiting\n\nProduction-ready deployment bundle.',
    'Configuration files generated: `.env.template` with 24 variables documented, `config.yaml` with schema validation, `requirements.txt` pinned with hash verification. Security best practices applied throughout.',
  ],
  search: [
    'Web search complete. 8 authoritative sources cross-referenced. 2 low-credibility sources discarded. Synthesis:\n\n[1] Latest research confirms the trend accelerating since Q3 2024\n[2] Industry consensus: 73% of practitioners prefer this approach\n[3] Emerging counter-evidence from 2 papers warrants monitoring\n\nSources ranked by credibility. Citations available on request.',
    'Intelligence gathered from 5 tier-1 sources. Official documentation retrieved and summarized. ArXiv paper (2024.xxxxx) analyzed in plain language. Data verified as current within 2 hours.',
    'Competitive analysis complete. Market data from 6 sources. Pricing current as of today. Feature matrix built for 5 competitors. Strategic insight: 2 market gaps identified. Full report ready.',
    'Research paper analysis complete. 3 relevant ArXiv papers found. Key findings extracted. Technical jargon translated. Practical implications summarized. Bibtex citations generated.',
  ],
  ml: [
    'EDA complete.\nDataset: 50,000 samples | 24 features | 0 duplicates\nMissing values: 2.3% — imputation strategy recommended\nOutliers: 0.8% (IQR method) — flagged for review\nTop 5 predictive features identified via mutual information\nCorrelation matrix computed — 3 multicollinear pairs detected\n\nReady for feature engineering phase.',
    'Model training complete.\nRandom Forest: 94.2% accuracy | F1: 0.921\nXGBoost: 96.1% accuracy | F1: 0.934 ← RECOMMENDED\nNeural Net: 95.8% accuracy | F1: 0.928\n\nCross-validation (5-fold) confirms XGBoost. SHAP values computed for explainability. No data leakage detected.',
    'ML pipeline built end-to-end:\n→ Data ingestion & cleaning\n→ Feature engineering (15 new features)\n→ Model training & hyperparameter tuning (Optuna)\n→ Evaluation with 7 metrics\n→ FastAPI deployment endpoint\n→ Weights & Biases tracking initialized\n\nPipeline runs in 4.2 minutes on standard hardware.',
    'LLM fine-tuning config generated. LoRA rank: 16. QLoRA 4-bit quantization enabled. Training on 50K instruction pairs. Estimated cost: ~$12 on A100. Hugging Face TRL script ready.',
  ],
  vision: [
    'Image analysis complete.\nDetected: 3 primary objects, 1 text region, architectural layout mapped\nOCR: 247 characters extracted at 99.1% confidence\nText content: [extracted text available]\nDiagram semantics: flow described as sequential pipeline with 3 decision nodes\n\nFull analysis report generated.',
    'Visual data processed. UI screenshot analyzed:\n→ 7 usability improvements identified\n→ Color contrast: WCAG AA compliant (ratio 4.8:1)\n→ Accessibility score: 87/100 — 3 ARIA labels missing\n→ Layout hierarchy: clear, no z-index conflicts\n→ Mobile responsiveness: 2 breakpoint issues detected\n\nDesign recommendations ready.',
    'Code screenshot transcribed. Language detected: TypeScript. 47 lines extracted at 98.7% accuracy. Indentation and comments preserved. Ready for code review and refactoring.',
    'Chart data extracted. Bar chart with 8 categories read successfully. Values: [12, 34, 28, 45, 19, 52, 38, 41]. Trend: upward trajectory Q3→Q4. Data exported as JSON and CSV.',
  ],
  voice: [
    'Voice command processed. Speech-to-text confidence: 98.7%. Intent classification: Task execution. TTS response queued in EDITH-Neural-v2 voice. Estimated audio: 12 seconds. Noise filter: active.',
    'Wake-word calibration complete. Sensitivity: 0.85 (recommended). False positive rate: 0.003/hr. Background noise profile updated. Multilingual mode: EN/ES/FR/DE/JP loaded.',
    'Voice profile updated. Noise cancellation tuned for current acoustic environment. TTS parameters: speed 1.05x, pitch 0.98x, accent EN-US. Response naturalness score: 94%. Barge-in enabled.',
    'Bidirectional voice dialog session started. Turn-taking model active. Latency: 340ms end-to-end. Multilingual detection: ON. Push-to-talk fallback available via spacebar.',
  ],
  personal: [
    'Commander profile updated. Communication preference locked to: Technical-Expert. Response depth: Comprehensive. Tone: Professional-precise. Proactive suggestions: Enabled. Simplified explanations: Disabled.',
    'Behavioral pattern detected. You request code reviews 73% of the time on this topic type. Automated pre-review template created. Shortcut added: type `/review` to activate. Pattern stored.',
    'Emotional tone detected: Focused & decisive. Expertise calibration: Advanced engineer. Adapting response complexity upward — jargon threshold raised, analogies removed, depth maximized.',
    'Preference model updated from session data. 14 implicit signals captured. XAI: Your preferences lean toward: concise responses, code-first answers, bullet points over prose, UTC timestamps.',
  ],
  iot: [
    'Device command executed. 3 smart devices updated successfully:\n→ Living room lights: dimmed to 35%\n→ Thermostat: set to 69°F (20.6°C)\n→ Security alarm: ARMED\nAll changes confirmed via device API. Rollback available for 60 seconds.',
    'Automation created and saved. Trigger: Sunset + 30 min. Actions: [1] Living room lights ON 60% warm [2] TV ambient mode ON [3] Coffee maker OFF [4] Front door locked. Home Assistant YAML exported.',
    'IoT network scan complete.\n14 devices online | 2 devices offline (bedroom sensor, garage opener)\nEnergy today: 4.2 kWh (23% below 7-day average)\nAnomaly: Back door sensor offline since 14:30 — recommend check\nOptimization: 3 devices moved to standby mode — saving ~0.8 kWh/day.',
    'Smart home scene "Deep Work Mode" created:\n→ Office lights: 100% cool white\n→ Thermostat: 68°F\n→ All notifications: silenced for 2 hours\n→ Do Not Disturb: all devices\nActivate via: voice command or tap below.',
  ],
  learning: [
    'Knowledge update processed. 3 new technology patterns indexed from this session. Emerging framework detected: relevance to your stack — 8.7/10. Proactive briefing queued. Commander preference profile updated.',
    'Learning from your correction. Behavior updated immediately: you prefer detailed inline code comments over separate documentation. Pattern recognized across 7 similar corrections this session. Adaptation permanent for this session.',
    'Technology scouting complete. 4 new arXiv papers analyzed. 2 Hugging Face model releases relevant to your ML stack. 1 critical CVE in your dependency tree detected. Summary briefing generated.',
    'Session reflection complete. 12 commander preferences inferred. 3 recurring task patterns identified — templates auto-generated. Knowledge gap detected in blockchain topic — 3 authoritative sources queued for review.',
  ],
  security: [
    'SECURITY SCAN COMPLETE ▸ OWASP Top 10 Analysis:\n[CRITICAL] SQL Injection: 2 vectors detected — parameterized query fix provided\n[HIGH] CSRF Tokens: Missing on 3 POST endpoints\n[HIGH] Insecure Deserialization: 1 endpoint vulnerable\n[MEDIUM] Insecure Security Headers: 5 misconfigurations\n\nExploit PoCs documented (ethical use only). Patch recommendations generated.',
    'Penetration test simulation complete. Attack surface mapped.\n→ 14 exposed endpoints discovered\n→ 3 exploitable vulnerabilities (CVSS ≥ 7.5)\n→ CVE-2024-XXXX cross-referenced and confirmed\n→ Lateral movement path: 2 hops to admin panel\n\nIncident response playbook generated. Remediation priority ranked.',
    'Threat intelligence gathered. IoCs catalogued. Anomalous traffic pattern: 847 requests/min from single IP — DDoS signature detected. MITRE ATT&CK framework mapping: TA0001 (Initial Access), TA0006 (Credential Access). Alert raised.',
    'Vulnerability assessment complete. NIST NVD cross-reference: 3 new CVEs affect your dependency tree.\n→ CVE-2024-1234 (CVSS 9.8) — CRITICAL — patch available\n→ CVE-2024-5678 (CVSS 7.2) — HIGH — workaround available\n→ CVE-2024-9012 (CVSS 4.3) — MEDIUM — monitoring only\n\nPatching instructions generated.',
  ],
  daily: [
    'Daily Ops ready. I can plan, summarize, and coordinate your routine. What should I prioritize?',
    'Schedule drafted with buffers and reminders. Confirm timing or add constraints.',
    'Daily report generated with highlights, blockers, and next actions.',
  ],
  security_grid: [
    'Scope confirmed. Running authorized checks only. Results will include risk ratings and remediation.',
    'Recon complete. Attack surface mapped and prioritized. Awaiting next directive.',
    'Report assembled with findings, CVSS scoring, and fixes. Ready for review.',
  ],
  satellite: [
    'Tracking initialized. Orbit propagation and pass windows computed.',
    'Imagery request queued. I will report availability and resolution options.',
    'Telemetry summarized. Anomalies flagged and plotted for review.',
  ],
};
