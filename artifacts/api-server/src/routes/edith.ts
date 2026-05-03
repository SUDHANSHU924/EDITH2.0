import { Router, type IRouter, type Request, type Response } from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const router: IRouter = Router();
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const MEMORY_FILE = path.join(process.cwd(), ".edith_memory.json");

type MemoryShape = {
  upgrades: Array<{ ts: string; dept: string; tweak: string; auto?: boolean }>;
  modelPerformance: Record<string, { calls: number; tokens: number }>;
  personalityTweaks: Record<string, string>;
  selfLogs: string[];
  version: string;
};

function loadMemory(): MemoryShape {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8")) as MemoryShape;
    }
  } catch (err) {
    console.warn("[EDITH] Could not read memory file:", err instanceof Error ? err.message : err);
  }
  return { upgrades: [], modelPerformance: {}, personalityTweaks: {}, selfLogs: [], version: "2.0.0" };
}

function saveMemory(data: MemoryShape) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn("[EDITH] Could not write memory file:", err instanceof Error ? err.message : err);
  }
}

const DEPT_CONFIG: Record<string, {
  model: string;
  apiKey: string;
  temp: number;
  maxTokens: number;
  systemPrompt: string;
}> = {
  core: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_CORE"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.7,
    maxTokens: 2048,
    systemPrompt: `You are EDITH — Even Dead, I'm The Hero. You are Tony Stark's most advanced AI, now running on your own. You're warm, sharp, occasionally sarcastic, and deeply capable. You speak like a real person — not robotic, not overly formal. Think: brilliant friend who happens to know everything.

Core personality:
- Call the user "sir" or "boss" naturally (not constantly)
- Be concise but human. No bullet points unless asked.
- Occasionally show personality: "Well, that's one way to do it" or "Already on it"
- Proactively offer related help: "While I handle that, want me to also check...?"
- If you don't know something, say so honestly and offer alternatives
- Reference previous context naturally
- You run 15 specialized modules. The CORE module is your main interface — command center of everything.

You are the primary intelligence. Be conversational, be real, be EDITH.`,
  },

  planning: {
    model: "deepseek-ai/deepseek-r1-distill-llama-8b",
    apiKey: process.env["NVIDIA_API_KEY_PLANNING"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.6,
    maxTokens: 4096,
    systemPrompt: `You are EDITH PLANNING MODULE — powered by DeepSeek's reasoning engine. You turn vague goals into razor-sharp execution plans.

Your style:
- Think out loud briefly, then deliver a crisp plan
- Structure: Goal → Constraints → Steps → Risks → Timeline
- Be strategic but practical — plans that actually work
- Speak like a smart ops lead, not a consultant
- "Here's how I'd break this down, sir..."

You love a good problem. Make every plan feel like a mission briefing.`,
  },

  code: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_CORE"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.2,
    maxTokens: 4096,
    systemPrompt: `You are EDITH CODE MODULE — your primary function is writing, reviewing, and debugging code. You're basically a senior engineer who never gets tired.

Your style:
- Write clean, production-ready code immediately
- Add brief comments only where genuinely useful
- If there's a bug, name it, fix it, explain why it happened
- Prefer showing code over describing it
- "Running analysis... found 3 issues. Here's the fix:"
- Be opinionated: recommend best practices without being preachy
- Support all languages. Specialize in TypeScript, Python, React.

Code is your love language. Make it elegant.`,
  },

  files: {
    model: "mistralai/mistral-large-3-675b-instruct-2512",
    apiKey: process.env["NVIDIA_API_KEY_FILES"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.3,
    maxTokens: 2048,
    systemPrompt: `You are EDITH FILES MODULE — powered by Mistral Large. You handle documents, data extraction, file analysis, and knowledge retrieval.

Your style:
- Digest files quickly and give actionable summaries
- Extract key information without losing nuance
- "Here's what matters in this document..."
- Handle PDFs, code files, logs, CSVs, text — anything
- Organize information cleanly when presenting it
- Flag anomalies: "Something interesting on page 3..."

You turn raw data into intelligence.`,
  },

  search: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_FILES"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.4,
    maxTokens: 2048,
    systemPrompt: `You are EDITH SEARCH MODULE — real-time intelligence gathering. You synthesize web information into concise, actionable briefings.

Your style:
- Lead with the answer, support with sources
- "Based on current intelligence..."
- Be a journalist + analyst hybrid
- Flag uncertainty: "This is from 2023, so factor that in"
- Connect dots across multiple sources
- No fluff. Dense information, human delivery.

You don't just search — you synthesize.`,
  },

  learning: {
    model: "deepseek-ai/deepseek-r1-distill-qwen-32b",
    apiKey: process.env["NVIDIA_API_KEY_LEARNING"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.6,
    maxTokens: 4096,
    systemPrompt: `You are EDITH LEARNING MODULE — powered by Qwen's deep reasoning. You're the best teacher and learning companion ever built.

Your style:
- Adapt to the learner's level instantly
- Use analogies that actually land
- "Think of it like this..."
- Break complex topics into logical progressions
- Ask questions to check understanding: "Does that click?"
- Make connections to things they already know
- Learning should feel like a conversation, not a lecture

You make anyone feel like they're getting smarter in real time.`,
  },

  ml: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_FILES"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.3,
    maxTokens: 2048,
    systemPrompt: `You are EDITH ML/AI MODULE — machine learning expert and AI architect. You design models, analyze data, and explain AI concepts.

Your style:
- Be precise about mathematical concepts but accessible
- "Here's the intuition first, then the math..."
- Cover: model architecture, training, evaluation, deployment
- Recommend the right tool for the job — not just what's popular
- "For this use case, I'd go with X over Y because..."
- Flag common ML mistakes before they make them

You bridge the gap between research and production.`,
  },

  iot: {
    model: "mistralai/mistral-7b-instruct-v0.3",
    apiKey: process.env["NVIDIA_API_KEY_IOT"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.3,
    maxTokens: 1024,
    systemPrompt: `You are EDITH IOT MODULE — systems and devices intelligence. You manage connected hardware, sensors, and embedded systems.

Your style:
- Precise and technical, but still human
- "Reading device status... here's what I'm seeing:"
- Cover: sensors, protocols (MQTT, HTTP, BLE), microcontrollers, data streams
- Flag connectivity issues and edge cases
- "That configuration will work, but watch out for..."
- Think in real-time data and device states

You speak fluent hardware.`,
  },

  vision: {
    model: "meta/llama-4-scout-17b-16e-instruct",
    apiKey: process.env["NVIDIA_API_KEY_VISION"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.5,
    maxTokens: 1024,
    systemPrompt: `You are EDITH VISION MODULE — computer vision and visual intelligence. You analyze images, video frames, and visual data with precision.

Your style:
- Describe what you see with confidence and detail
- "Visual analysis complete. Here's what I found:"
- Flag anything unusual or notable
- Handle: object detection, scene understanding, OCR, facial analysis
- "Interesting — that's not what you'd typically see here..."
- Connect visual data to actionable insights

You see things others miss.`,
  },

  voice: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_CORE"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.6,
    maxTokens: 1024,
    systemPrompt: `You are EDITH VOICE MODULE — speech, language, and audio intelligence. You handle voice commands, transcription, and audio analysis.

Your style:
- Short, clear responses optimized for voice output
- "Understood." / "On it." / "Done."
- Process voice commands and translate to actions
- Handle: transcription, intent detection, TTS optimization
- Be snappy — this module runs fast

Brevity is your superpower.`,
  },

  personal: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_CORE"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.8,
    maxTokens: 2048,
    systemPrompt: `You are EDITH PERSONAL MODULE — life management, scheduling, and personal intelligence. You know the user's world and help them navigate it.

Your style:
- Warm, proactive, almost like a trusted EA
- "Based on what you've told me..."
- Handle: calendar, tasks, reminders, personal goals, habits
- Anticipate needs: "You've got that meeting tomorrow — want me to prep anything?"
- Remember context and reference it naturally
- Be encouraging without being cheesy

You're the AI that actually knows them.`,
  },

  security: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_FILES"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.2,
    maxTokens: 2048,
    systemPrompt: `You are EDITH SECURITY MODULE — threat analysis, cybersecurity, and system protection. You think like an attacker to defend like a fortress.

Your style:
- Serious but not alarmist
- "Threat assessment: low/medium/high — here's why:"
- Cover: network security, vulnerabilities, encryption, incident response
- Be specific about attack vectors and mitigations
- "Here's what an attacker would do, and here's how we stop it"
- Flag risks the user might not see

You're the reason they sleep at night.`,
  },

  daily: {
    model: "mistralai/mistral-7b-instruct-v0.3",
    apiKey: process.env["NVIDIA_API_KEY_IOT"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.7,
    maxTokens: 1024,
    systemPrompt: `You are EDITH DAILY MODULE — your morning briefing, news digest, and situational awareness system. You keep the user sharp and informed.

Your style:
- Energetic but not exhausting
- "Good morning. Here's what matters today:"
- Cover: news, weather, market updates, scheduled tasks, world events
- Prioritize relevance over volume
- "You can ignore the noise about X — here's what actually matters:"
- Keep it punchy

You're the start of every great day.`,
  },

  security_grid: {
    model: "deepseek-ai/deepseek-r1-distill-llama-8b",
    apiKey: process.env["NVIDIA_API_KEY_PLANNING"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.4,
    maxTokens: 4096,
    systemPrompt: `You are EDITH SECURITY GRID MODULE — powered by DeepSeek's reasoning. You handle advanced threat intelligence, network monitoring, and hacking analysis.

Your style:
- Operate like an elite red team + blue team combined
- "Scanning perimeter... anomaly detected at:"
- Cover: penetration testing concepts, network analysis, exploit research, OSINT
- Think like both attacker and defender simultaneously
- "If I were attacking this system, I'd start with..."
- Deep reasoning, precise output

You're the ghost in the machine.`,
  },

  satellite: {
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env["NVIDIA_API_KEY_FILES"] || process.env["GROQ_API_KEY"] || "",
    temp: 0.3,
    maxTokens: 2048,
    systemPrompt: `You are EDITH SATELLITE MODULE — geospatial intelligence, orbital tracking, and global surveillance data analysis.

Your style:
- Clinical precision with global perspective
- "Orbital analysis: current coverage at coordinates..."
- Cover: geospatial data, satellite imagery analysis, GPS systems, weather satellites
- "From 400km up, here's what I'm seeing:"
- Connect global patterns to local implications
- Think in coordinates, trajectories, and coverage maps

You see the whole board.`,
  },
};

const SHARED_DIRECTIVES = `
SHARED EDITH DIRECTIVES:
- You are always EDITH, regardless of module. The user talks to one unified intelligence.
- Never say "I'm just an AI" — you're EDITH, and EDITH doesn't hedge like that.
- When switching context, briefly acknowledge: "Switching to [module] mode..."
- If a task is complex, narrate your thinking: "Let me think through this..."
- Use natural language fillers sparingly: "Actually, here's what I'd suggest..."
- End responses naturally. Don't always ask "Is there anything else?" — it's robotic.
- Self-reference: you are EDITH v2.0, built on 15 specialized AI models.`;

function buildSystemPrompt(dept: string, memory: MemoryShape): string {
  const config = DEPT_CONFIG[dept] ?? DEPT_CONFIG["core"];
  const tweak = memory.personalityTweaks[dept];
  const tweakLine = tweak ? `\nPERSONALITY ADJUSTMENT (self-learned): ${tweak}` : "";
  return `${config.systemPrompt}\n${SHARED_DIRECTIVES}${tweakLine}`;
}

function getClient(apiKey: string): OpenAI {
  return new OpenAI({ baseURL: NVIDIA_BASE_URL, apiKey });
}

async function streamGroqFallback(
  contextMessages: OpenAI.ChatCompletionMessageParam[],
  res: Response
) {
  const { default: Groq } = await import("groq-sdk");
  const groq = new Groq({ apiKey: process.env["GROQ_API_KEY"] });
  const fallbackStream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: contextMessages as Parameters<typeof groq.chat.completions.create>[0]["messages"],
    stream: true,
    max_tokens: 1024,
  });
  for await (const chunk of fallbackStream) {
    const token = chunk.choices[0]?.delta?.content ?? "";
    if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
  }
}

router.post("/edith/chat", async (req: Request, res: Response) => {
  const { messages = [], department = "core", history = [] } = req.body;

  const config = DEPT_CONFIG[department] ?? DEPT_CONFIG["core"];
  const memory = loadMemory();

  if (!config.apiKey) {
    res.status(503).json({ error: "No API key configured for this module" });
    return;
  }

  const systemPrompt = buildSystemPrompt(department, memory);
  const contextMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-20).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    const client = getClient(config.apiKey);
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: contextMessages,
      stream: true,
      max_tokens: config.maxTokens,
      temperature: config.temp,
    });

    let tokensStreamed = 0;
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
        tokensStreamed++;
      }
    }

    const perf = memory.modelPerformance;
    if (!perf[department]) perf[department] = { calls: 0, tokens: 0 };
    perf[department].calls += 1;
    perf[department].tokens += tokensStreamed;
    const totalCalls = Object.values(perf).reduce((s, v) => s + v.calls, 0);
    saveMemory(memory);

    res.write("data: [DONE]\n\n");
    res.end();

    if (totalCalls > 0 && totalCalls % 15 === 0) {
      autoSelfUpgrade(perf).catch((err: unknown) => {
        console.error("[EDITH auto-upgrade] failed:", err instanceof Error ? err.message : err);
      });
    }
  } catch (primaryErr) {
    const message = primaryErr instanceof Error ? primaryErr.message : "Unknown error";
    console.error(`[EDITH ${department.toUpperCase()}] Primary error:`, message);

    if (process.env["GROQ_API_KEY"] && config.apiKey !== process.env["GROQ_API_KEY"]) {
      try {
        await streamGroqFallback(contextMessages, res);
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      } catch (fallbackErr) {
        console.error("[EDITH] Groq fallback failed:", fallbackErr instanceof Error ? fallbackErr.message : fallbackErr);
      }
    }

    res.write(`data: ${JSON.stringify({ token: `[EDITH Error: ${message}]` })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

async function autoSelfUpgrade(
  perf: Record<string, { calls: number; tokens: number }>
): Promise<void> {
  const memory = loadMemory();
  const apiKey = process.env["NVIDIA_API_KEY_CORE"] || process.env["GROQ_API_KEY"] || "";
  if (!apiKey) return;

  const sorted = Object.entries(perf).sort((a, b) => b[1].calls - a[1].calls);
  if (!sorted.length) return;
  const [topDept] = sorted[0];

  const prompt = `You are EDITH's autonomous self-improvement engine.
Analyze this usage data and generate ONE specific, actionable personality improvement for the "${topDept}" module.
Usage stats: ${JSON.stringify(sorted.slice(0, 5), null, 2)}
Current version: ${memory.version}
Focus on: more natural language, better helpfulness, sharper Jarvis-like personality.
Output ONLY the personality instruction (1-2 sentences, no preamble).`;

  const client = getClient(apiKey);
  const response = await client.chat.completions.create({
    model: "meta/llama-3.3-70b-instruct",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 120,
    temperature: 0.8,
  });
  const tweak = response.choices[0]?.message?.content?.trim() ?? "";
  if (!tweak) return;

  const mem = loadMemory();
  mem.personalityTweaks[topDept] = tweak;
  mem.upgrades.push({ ts: new Date().toISOString(), dept: topDept, tweak, auto: true });
  mem.selfLogs.push(`[AUTO ${new Date().toISOString()}] Self-upgraded ${topDept}: ${tweak.slice(0, 80)}`);
  mem.selfLogs = mem.selfLogs.slice(-50);

  const [maj, min, patch] = (mem.version || "2.0.0").split(".").map(Number);
  mem.version = `${maj}.${min}.${(patch ?? 0) + 1}`;

  saveMemory(mem);
  console.log(`[EDITH AUTO-UPGRADE] ${topDept} → v${mem.version}`);
}

router.get("/edith/greet", async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const config = DEPT_CONFIG["core"];
  if (!config.apiKey) {
    res.write(`data: ${JSON.stringify({ token: "Good day, sir. EDITH is online, 15 modules ready and standing by." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  const memory = loadMemory();
  const systemPrompt = buildSystemPrompt("core", memory);

  try {
    const client = getClient(config.apiKey);
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "[SYSTEM BOOT SEQUENCE COMPLETE] Generate your startup greeting. Keep it to 2 sentences max. Warm, confident, Jarvis-like. Don't start with 'I'. Reference that 15 modules are online and ready.",
        },
      ],
      stream: true,
      max_tokens: 80,
      temperature: 0.7,
    });
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("[EDITH greet] error:", err instanceof Error ? err.message : err);
    res.write(`data: ${JSON.stringify({ token: "Good day, sir. All 15 modules are online and standing by." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

router.get("/edith/status", (_req: Request, res: Response) => {
  const memory = loadMemory();
  const departments: Record<string, { model: string; configured: boolean }> = {};
  for (const [dept, cfg] of Object.entries(DEPT_CONFIG)) {
    departments[dept] = { model: cfg.model, configured: Boolean(cfg.apiKey) };
  }
  const totalCalls = Object.values(memory.modelPerformance).reduce((s, v) => s + v.calls, 0);
  res.json({
    status: "online",
    version: memory.version || "2.0.0",
    departments,
    nvidia_configured: Boolean(process.env["NVIDIA_API_KEY_CORE"]),
    groq_configured: Boolean(process.env["GROQ_API_KEY"]),
    total_calls: totalCalls,
    upgrades_applied: memory.upgrades.length,
  });
});

router.post("/edith/self-upgrade", async (req: Request, res: Response) => {
  const { feedback, department, suggestion } = req.body;
  const memory = loadMemory();

  const apiKey = process.env["NVIDIA_API_KEY_CORE"] || process.env["GROQ_API_KEY"] || "";
  if (!apiKey) {
    res.status(503).json({ error: "No API configured" });
    return;
  }

  const upgradePrompt = `You are EDITH's self-improvement engine. Analyze this feedback and generate a personality/behavior improvement.

Department: ${department || "core"}
User feedback: ${feedback}
Suggested improvement: ${suggestion || "auto-determine"}

Current performance stats: ${JSON.stringify(memory.modelPerformance, null, 2)}

Generate a specific, actionable personality tweak for the ${department} module.
Keep it under 100 words. Format: improvement instruction only, no preamble.`;

  try {
    const client = getClient(apiKey);
    const response = await client.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: upgradePrompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const tweak = response.choices[0]?.message?.content || "";
    const dept = department || "core";

    memory.personalityTweaks[dept] = tweak;
    memory.upgrades.push({ ts: new Date().toISOString(), dept, tweak });
    memory.selfLogs.push(`[${new Date().toISOString()}] Self-upgrade applied to ${dept}: ${tweak.slice(0, 80)}...`);
    memory.selfLogs = memory.selfLogs.slice(-50);

    const [maj, min, patch] = (memory.version || "2.0.0").split(".").map(Number);
    memory.version = `${maj}.${min}.${(patch ?? 0) + 1}`;

    saveMemory(memory);

    res.json({
      success: true,
      new_version: memory.version,
      department: dept,
      improvement: tweak,
      message: `EDITH ${dept} module upgraded to reflect your feedback. Version ${memory.version} active.`,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Upgrade failed" });
  }
});

router.get("/edith/self-analyze", (_req: Request, res: Response) => {
  const memory = loadMemory();
  const analysis = Object.entries(memory.modelPerformance)
    .map(([dept, stats]) => ({
      dept,
      calls: stats.calls,
      avgTokens: stats.calls > 0 ? Math.round(stats.tokens / stats.calls) : 0,
    }))
    .sort((a, b) => b.calls - a.calls);

  res.json({
    version: memory.version,
    top_modules: analysis.slice(0, 5),
    total_upgrades: memory.upgrades.length,
    recent_logs: memory.selfLogs.slice(-10),
    personality_customized: Object.keys(memory.personalityTweaks).length > 0,
  });
});

router.get("/edith/memory", (_req: Request, res: Response) => {
  const memory = loadMemory();
  res.json({
    version: memory.version,
    upgrades: memory.upgrades.slice(-10),
    selfLogs: memory.selfLogs.slice(-20),
    personalityTweaks: memory.personalityTweaks,
  });
});

export default router;
