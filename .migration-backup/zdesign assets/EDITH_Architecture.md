# E.D.I.T.H — Complete Project Architecture
> Paste this into your GitHub Codespace agent to scaffold the full skeleton

---

## 📁 FULL FOLDER & FILE STRUCTURE

```
edith/
│
├── .env.local.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── /app
│   ├── layout.tsx                        # Root layout, dark theme, font setup
│   ├── page.tsx                          # Landing / login page
│   ├── globals.css
│   │
│   ├── /commander                        # Main EDITH interface
│   │   ├── page.tsx                      # Commander dashboard
│   │   └── layout.tsx                    # Commander shell with sidebar
│   │
│   ├── /hacker                           # System 14 — restricted gate
│   │   ├── page.tsx                      # Auth gate UI
│   │   └── layout.tsx                    # Hacker mode shell
│   │
│   ├── /satellite                        # System 15 — restricted gate
│   │   ├── page.tsx                      # Satellite dashboard
│   │   └── layout.tsx                    # Satellite mode shell
│   │
│   └── /api
│       ├── /edith
│       │   └── route.ts                  # CORE: Main AI endpoint → DeepSeek R1
│       │
│       ├── /search
│       │   └── route.ts                  # System 05: Tavily web search
│       │
│       ├── /code
│       │   └── route.ts                  # System 03: DeepSeek Coder V2
│       │
│       ├── /vision
│       │   └── route.ts                  # System 09: InternVL2 / Qwen VL
│       │
│       ├── /voice
│       │   ├── transcribe/route.ts       # System 10: Whisper STT
│       │   └── speak/route.ts            # System 10: Kokoro TTS
│       │
│       ├── /memory
│       │   ├── save/route.ts             # Save to ChromaDB
│       │   └── recall/route.ts           # Query ChromaDB
│       │
│       ├── /files
│       │   └── route.ts                  # System 04: File generation
│       │
│       ├── /hacker
│       │   ├── scan/route.ts             # System 14: Vulnerability scan
│       │   ├── cve/route.ts              # System 14: CVE lookup
│       │   ├── osint/route.ts            # System 14: OSINT
│       │   └── report/route.ts           # System 14: Pentest report gen
│       │
│       ├── /satellite
│       │   ├── track/route.ts            # System 15: N2YO satellite tracking
│       │   ├── imagery/route.ts          # System 15: NASA / ESA imagery
│       │   ├── gps/route.ts              # System 15: GPS / GNSS intel
│       │   └── weather/route.ts          # System 15: NOAA weather satellite
│       │
│       └── /auth
│           └── [...nextauth]/route.ts    # NextAuth.js
│
│
├── /systems                              # Feature logic — one folder per system
│   │
│   ├── /01-convo                         # Conversational Intelligence
│   │   ├── index.ts                      # System entry point
│   │   ├── nlu.ts                        # Natural Language Understanding
│   │   ├── context.ts                    # Multi-turn context retention
│   │   ├── tone.ts                       # Tone adaptation
│   │   ├── multilingual.ts               # Multilingual dialogue
│   │   └── summarize.ts                  # Summarization on demand
│   │
│   ├── /02-planning                      # Autonomous Planning & Reasoning
│   │   ├── index.ts
│   │   ├── chain-of-thought.ts           # CoT reasoning pipeline
│   │   ├── tree-of-thought.ts            # ToT branching logic
│   │   ├── task-decomposer.ts            # Task breakdown engine
│   │   ├── react-loop.ts                 # ReAct: Reason + Act loop
│   │   ├── task-log.ts                   # Progress tracker
│   │   ├── multi-agent.ts                # Multi-agent delegation
│   │   └── self-critique.ts              # Revision & reflection
│   │
│   ├── /03-code                          # Code Generation & Engineering
│   │   ├── index.ts
│   │   ├── generator.ts                  # Full-stack code generation
│   │   ├── reviewer.ts                   # Code review & refactoring
│   │   ├── debugger.ts                   # Debug & root cause analysis
│   │   ├── test-writer.ts                # Unit & integration test gen
│   │   ├── security-review.ts            # Security code review
│   │   ├── docs-writer.ts                # Code documentation
│   │   └── devops.ts                     # Docker, CI/CD, infra scripts
│   │
│   ├── /04-files                         # File Creation & Document Engineering
│   │   ├── index.ts
│   │   ├── markdown.ts                   # Markdown reports
│   │   ├── docx.ts                       # Word documents
│   │   ├── pdf.ts                        # PDF files
│   │   ├── pptx.ts                       # Presentations
│   │   ├── xlsx.ts                       # Spreadsheets
│   │   ├── json-yaml.ts                  # JSON / YAML / TOML
│   │   └── dockerfile.ts                 # Dockerfile & Compose
│   │
│   ├── /05-search                        # Internet Search & Real-Time Research
│   │   ├── index.ts
│   │   ├── tavily.ts                     # Tavily search client
│   │   ├── synthesizer.ts                # Multi-source synthesis
│   │   ├── credibility.ts                # Source credibility assessment
│   │   └── monitor.ts                    # News & market monitoring
│   │
│   ├── /06-learn                         # Self-Learning & Knowledge Evolution
│   │   ├── index.ts
│   │   ├── correction-tracker.ts         # Tracks Commander corrections
│   │   ├── pattern-engine.ts             # Pattern recognition
│   │   ├── tech-scout.ts                 # Technology scouting
│   │   ├── profile-builder.ts            # Commander profile builder
│   │   └── feedback-loop.ts              # Feedback loop processor
│   │
│   ├── /07-ml                            # Data Science, ML & AI Engineering
│   │   ├── index.ts
│   │   ├── data-cleaner.ts               # Data cleaning & preprocessing
│   │   ├── eda.ts                        # Exploratory data analysis
│   │   ├── rag-designer.ts               # RAG system design
│   │   ├── model-evaluator.ts            # Model evaluation
│   │   ├── mlops.ts                      # MLOps pipelines
│   │   └── visualizer.ts                 # Data visualization
│   │
│   ├── /08-iot                           # Smart Home, IoT & Device Control
│   │   ├── index.ts
│   │   ├── home-assistant.ts             # HA YAML automation generator
│   │   ├── device-commands.ts            # Voice-controlled device commands
│   │   ├── automation-builder.ts         # Routine builder
│   │   ├── scene-manager.ts              # Scene management
│   │   └── energy-monitor.ts             # Energy monitoring
│   │
│   ├── /09-vision                        # Vision, Image & Multimodal
│   │   ├── index.ts
│   │   ├── image-analyzer.ts             # Image analysis & description
│   │   ├── ocr.ts                        # OCR text extraction
│   │   ├── diagram-reader.ts             # Architecture diagram interpretation
│   │   ├── chart-extractor.ts            # Chart & graph data extraction
│   │   └── screenshot-reviewer.ts        # UI/UX screenshot review
│   │
│   ├── /10-voice                         # Voice Interaction & Speech
│   │   ├── index.ts
│   │   ├── stt.ts                        # Speech-to-text (Whisper API)
│   │   ├── tts.ts                        # Text-to-speech (Kokoro API)
│   │   ├── wake-word.ts                  # Wake-word activation
│   │   ├── noise-filter.ts               # Noise filtering
│   │   └── voice-dialog.ts               # Bidirectional voice dialog
│   │
│   ├── /11-personal                      # Personalization & Human Intelligence
│   │   ├── index.ts
│   │   ├── emotion-detector.ts           # Emotional tone detection
│   │   ├── empathy-mode.ts               # Empathetic response mode
│   │   ├── preference-model.ts           # Commander preference modeling
│   │   ├── expertise-calibrator.ts       # Expertise level calibration
│   │   ├── habit-learner.ts              # Habit & routine learning
│   │   └── proactive-suggest.ts          # Proactive suggestions
│   │
│   ├── /12-security                      # Security, Privacy & Ethics
│   │   ├── index.ts
│   │   ├── encryption.ts                 # E2E encryption layer
│   │   ├── audit-log.ts                  # Encrypted audit log
│   │   ├── threat-detector.ts            # Threat detection alerting
│   │   ├── action-safeguard.ts           # Irreversible action safeguard
│   │   └── ethics-enforcer.ts            # Ethical constraint enforcement
│   │
│   ├── /13-daily                         # Basic & Everyday Tasks
│   │   ├── index.ts
│   │   ├── knowledge-qa.ts               # General knowledge Q&A
│   │   ├── write-edit.ts                 # Write & edit text
│   │   ├── translate.ts                  # Translation (50+ languages)
│   │   ├── calendar.ts                   # Calendar & reminders
│   │   ├── weather.ts                    # Weather lookup
│   │   ├── calculator.ts                 # Calculations
│   │   ├── finance.ts                    # Personal finance basics
│   │   ├── health.ts                     # Health information
│   │   └── creative.ts                   # Creative writing & brainstorm
│   │
│   ├── /14-hacker                        # Ethical Hacker Mode (RESTRICTED)
│   │   ├── index.ts                      # Auth gate — token required
│   │   ├── auth-gate.ts                  # Authorization verification
│   │   ├── vuln-scanner.ts               # OWASP Top 10 scanner
│   │   ├── cve-intel.ts                  # CVE lookup (NVD/NIST API)
│   │   ├── threat-feeds.ts               # AlienVault OTX, GreyNoise
│   │   ├── defensive-gen.ts              # WAF / IDS rule generation
│   │   ├── network-recon.ts              # Subdomain & surface mapping
│   │   ├── malware-analyzer.ts           # Static malware analysis
│   │   ├── pentest-support.ts            # Pentest checklist & reports
│   │   ├── osint-engine.ts               # OSINT intelligence
│   │   ├── social-eng.ts                 # Social engineering awareness
│   │   ├── incident-response.ts          # Breach response playbooks
│   │   ├── compliance.ts                 # GDPR / ISO / SOC2 audit
│   │   └── report-gen.ts                 # PDF/DOCX report generation
│   │
│   └── /15-satellite                     # Satellite Intelligence (RESTRICTED)
│       ├── index.ts                      # Auth gate — high-level only
│       ├── auth-gate.ts                  # Satellite mode authorization
│       ├── secure-comms.ts               # Satellite fallback comms (AES-256)
│       ├── earth-obs.ts                  # Earth observation & imagery
│       ├── sat-tracker.ts                # Live satellite tracking (N2YO)
│       ├── orbital.ts                    # Orbital prediction & pass alerts
│       ├── gps-intel.ts                  # GPS/GNSS intel & spoofing detect
│       ├── env-monitor.ts                # NOAA weather satellite data
│       ├── rf-signals.ts                 # RF spectrum monitoring
│       ├── nasa-api.ts                   # NASA Earthdata integration
│       ├── esa-api.ts                    # ESA Sentinel Hub integration
│       ├── spacetrack.ts                 # Space-Track.org database
│       ├── intel-fusion.ts               # Satellite + OSINT data merging
│       └── surveillance.ts               # Restricted area monitoring
│
│
├── /lib                                  # Shared utilities & API clients
│   ├── edith-prompt.ts                   # EDITH master system prompt
│   ├── nvidia.ts                         # NVIDIA API client (DeepSeek R1)
│   ├── groq.ts                           # Groq API client (LLaMA fallback)
│   ├── huggingface.ts                    # HuggingFace Inference API
│   ├── supabase.ts                       # Supabase client
│   ├── memory.ts                         # ChromaDB session memory
│   ├── embeddings.ts                     # BGE-M3 embedding client
│   ├── tavily.ts                         # Tavily search client
│   ├── e2b.ts                            # E2B code sandbox client
│   ├── auth.ts                           # NextAuth config
│   ├── encryption.ts                     # AES-256 encryption utils
│   ├── rate-limiter.ts                   # API rate limiting
│   ├── logger.ts                         # Structured logging
│   └── types.ts                          # Global TypeScript types
│
│
├── /components
│   │
│   ├── /chat
│   │   ├── ChatWindow.tsx                # Main message area with streaming
│   │   ├── MessageBubble.tsx             # Individual message component
│   │   ├── CommanderInput.tsx            # Input bar + voice button
│   │   ├── StatusBar.tsx                 # EDITH status indicator
│   │   ├── ThinkingIndicator.tsx         # Shows EDITH reasoning
│   │   ├── TaskLog.tsx                   # Multi-phase task progress
│   │   └── CodeBlock.tsx                 # Syntax highlighted code output
│   │
│   ├── /sidebar
│   │   ├── Sidebar.tsx                   # Main navigation sidebar
│   │   ├── SystemPanel.tsx               # Active system indicator
│   │   ├── SessionHistory.tsx            # Past sessions list
│   │   └── CommanderProfile.tsx          # Profile & preferences panel
│   │
│   ├── /voice
│   │   ├── VoiceButton.tsx               # Push-to-talk button
│   │   ├── WaveformVisualizer.tsx        # Audio waveform display
│   │   └── WakeWordListener.tsx          # Background wake-word listener
│   │
│   ├── /hacker
│   │   ├── HackerAuthGate.tsx            # Authorization UI
│   │   ├── VulnScanner.tsx               # Vulnerability scan UI
│   │   ├── ThreatDashboard.tsx           # CVE & threat feed display
│   │   ├── OSINTPanel.tsx                # OSINT results panel
│   │   └── ReportGenerator.tsx           # Pentest report UI
│   │
│   ├── /satellite
│   │   ├── SatelliteAuthGate.tsx         # Authorization UI
│   │   ├── SatTracker.tsx                # Live satellite map
│   │   ├── ImageryViewer.tsx             # Satellite imagery display
│   │   ├── GPSIntelPanel.tsx             # GPS intelligence panel
│   │   └── WeatherSatPanel.tsx           # Weather satellite data
│   │
│   └── /ui                               # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       └── toast.tsx
│
│
├── /hooks
│   ├── useEdith.ts                       # Main EDITH chat hook
│   ├── useVoice.ts                       # Voice input/output hook
│   ├── useMemory.ts                      # Session memory hook
│   ├── useStream.ts                      # Response streaming hook
│   ├── useCommanderProfile.ts            # Commander profile hook
│   └── useSystemStatus.ts               # Active system status hook
│
│
├── /store
│   ├── commanderStore.ts                 # Zustand: Commander state
│   ├── chatStore.ts                      # Zustand: Chat messages
│   ├── systemStore.ts                    # Zustand: Active system
│   └── sessionStore.ts                   # Zustand: Session data
│
│
├── /config
│   ├── systems.config.ts                 # All 15 system configs & metadata
│   ├── models.config.ts                  # Model routing config
│   ├── apis.config.ts                    # All API endpoints config
│   └── auth.config.ts                    # Auth & permission levels
│
│
├── /types
│   ├── edith.types.ts                    # EDITH core types
│   ├── message.types.ts                  # Chat message types
│   ├── system.types.ts                   # System module types
│   ├── hacker.types.ts                   # Hacker mode types
│   └── satellite.types.ts                # Satellite module types
│
│
├── /middleware.ts                        # Route protection middleware
│
│
└── /public
    ├── edith-logo.svg
    └── icons/
```

---

## 🔑 .env.local.example

```env
# ── CORE AI MODELS ──────────────────────────────
NVIDIA_API_KEY=                          # build.nvidia.com → DeepSeek R1
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL_MAIN=deepseek-ai/deepseek-r1
NVIDIA_MODEL_CODE=deepseek-ai/deepseek-coder-v2

GROQ_API_KEY=                            # console.groq.com → LLaMA fallback
GROQ_MODEL=llama-3.3-70b-versatile

HUGGINGFACE_API_KEY=                     # huggingface.co → Vision + Embeddings
HF_VISION_MODEL=OpenGVLab/InternVL2-8B
HF_EMBED_MODEL=BAAI/bge-m3

# ── SEARCH & TOOLS ──────────────────────────────
TAVILY_API_KEY=                          # tavily.com → web search

E2B_API_KEY=                             # e2b.dev → safe code execution

# ── DATABASE ────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# ── AUTH ────────────────────────────────────────
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# ── SECURITY APIs (System 14) ───────────────────
VIRUSTOTAL_API_KEY=                      # virustotal.com
SHODAN_API_KEY=                          # shodan.io
ABUSEIPDB_API_KEY=                       # abuseipdb.com
GREYNOISE_API_KEY=                       # greynoise.io
ALIENVAULT_OTX_KEY=                      # otx.alienvault.com

# ── SATELLITE APIs (System 15) ──────────────────
N2YO_API_KEY=                            # n2yo.com → satellite tracking
NASA_API_KEY=                            # api.nasa.gov → Earthdata
ESA_SENTINEL_KEY=                        # sentinel-hub.com
SPACETRACK_USER=                         # space-track.org
SPACETRACK_PASS=
NOAA_API_KEY=                            # api.weather.gov

# ── RESTRICTED MODE TOKENS ──────────────────────
HACKER_MODE_TOKEN=                       # Set your own secure token
SATELLITE_MODE_TOKEN=                    # Set your own secure token
```

---

## 📋 CODESPACE AGENT PROMPT

Copy and paste this exactly into your Claude Code agent in GitHub Codespace:

```
Create a Next.js 15 project called "edith" with TypeScript,
Tailwind CSS, App Router, and shadcn/ui installed.

Then scaffold ALL of these empty files and folders exactly
as specified in the EDITH architecture. For every .ts and
.tsx file, add only:
1. A one-line comment describing what this file does
2. A placeholder export so TypeScript doesn't error
3. No actual logic yet — skeleton only

Also:
- Create .env.local.example with all the keys listed
- Create .gitignore that excludes .env.local and node_modules
- Install these packages:
  next@15 react react-dom typescript tailwindcss
  @supabase/supabase-js zustand ai
  @ai-sdk/openai langchain chromadb
  next-auth lucide-react

After scaffolding, confirm every folder and file exists.
```

---

## 🏗️ BUILD ORDER (After Skeleton)

| Phase | What to Build | Estimated Sessions |
|---|---|---|
| **0** | Skeleton + env setup + repo | 1 session |
| **1** | Core engine: DeepSeek R1 API route + streaming | 1 session |
| **2** | System 01: Conversational Intelligence | 1 session |
| **3** | Figma UI → Next.js Chat UI shell | 1 session |
| **4** | System 03: Code generation module | 1 session |
| **5** | System 05: Web search (Tavily) | 1 session |
| **6** | System 04: File creation module | 1 session |
| **7** | System 02: Planning & reasoning | 1 session |
| **8** | System 10: Voice I/O | 1 session |
| **9** | System 09: Vision & multimodal | 1 session |
| **10** | Systems 06, 07: Learning + ML | 1-2 sessions |
| **11** | Systems 08, 11, 12, 13 | 2 sessions |
| **12** | System 14: Ethical Hacker Mode | 2 sessions |
| **13** | System 15: Satellite Intelligence | 2 sessions |
| **14** | Full integration + Vercel deploy | 1 session |
