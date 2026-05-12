export type LocalEdithAction = {
  type: "open_url";
  url: string;
};

export type LocalEdithReply = {
  reply: string;
  action?: LocalEdithAction;
};

export type LocalJarvisResult = {
  completed: boolean;
  answer: string;
  actions: string[];
  thoughts: string[];
  steps_taken: number;
  elapsed_seconds: number;
  model_used: string;
  tokens?: number;
};

const LOCAL_DEMO_ROUTES: Record<string, string> = {
  home: "/",
  features: "/features",
  download: "/download",
  pricing: "/pricing",
  docs: "/docs",
  commander: "/commander",
  dashboard: "/dashboard",
};

function extractSearchQuery(input: string) {
  const cleaned = input
    .replace(/^(open|launch|start|show|search|find|browse)\s+/i, "")
    .replace(/^(youtube|google|the web|web)\s+/i, "")
    .trim();
  return cleaned || "latest AI news";
}

function buildRouteReply(route: keyof typeof LOCAL_DEMO_ROUTES, label: string): LocalEdithReply {
  return {
    reply: `EDITH: Opening ${label}. Local demo mode is active, so the route is ready now.`,
    action: { type: "open_url", url: LOCAL_DEMO_ROUTES[route] },
  };
}

export function createLocalEdithReply(input: string): LocalEdithReply {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return {
      reply: "EDITH online. Commander recognized. How can I serve you today?",
    };
  }

  if (normalized.includes("youtube")) {
    const query = extractSearchQuery(input);
    return {
      reply: `EDITH: Opening YouTube...\nSearching '${query}'...\nDone Commander. 3 results found.`,
      action: {
        type: "open_url",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      },
    };
  }

  if (normalized.includes("features") || normalized.includes("systems")) {
    return buildRouteReply("features", "Features");
  }

  if (normalized.includes("download")) {
    return buildRouteReply("download", "Download");
  }

  if (normalized.includes("pricing") || normalized.includes("plan")) {
    return buildRouteReply("pricing", "Pricing");
  }

  if (normalized.includes("docs") || normalized.includes("documentation") || normalized.includes("help")) {
    return buildRouteReply("docs", "Documentation");
  }

  if (normalized.includes("commander") || normalized.includes("dashboard")) {
    return buildRouteReply(normalized.includes("dashboard") ? "dashboard" : "commander", normalized.includes("dashboard") ? "Dashboard" : "Commander");
  }

  if (normalized.includes("what can you do") || normalized.includes("help me") || normalized === "help") {
    return {
      reply:
        "EDITH: I can open routes, simulate computer control, explain the modules, and run in local demo mode until Groq is connected.",
    };
  }

  if (normalized.includes("open") && normalized.includes("website")) {
    return {
      reply: "EDITH: Opening the EDITH website now.",
      action: { type: "open_url", url: "/" },
    };
  }

  return {
    reply:
      "EDITH: Local demo mode is active. I can still respond, navigate pages, and simulate autonomy while the Groq backend is being connected.",
  };
}

export function createLocalJarvisResult(task: string): LocalJarvisResult {
  const normalized = task.toLowerCase();
  const thoughts = [
    `Analyzing objective: ${task}`,
    "Planning local execution path without backend dependency.",
    "Simulating browser, file, and desktop actions for demo continuity.",
  ];

  const actions: string[] = [];
  let answer = "Task acknowledged. Local demo mode completed the simulated workflow.";

  if (normalized.includes("youtube")) {
    actions.push("OPEN_URL https://www.youtube.com");
    answer = "Opened YouTube and queued the requested search in local demo mode.";
  } else if (normalized.includes("search")) {
    actions.push("SEARCH simulated query");
    answer = "Search flow completed in local demo mode.";
  } else if (normalized.includes("file")) {
    actions.push("CREATE_FILE simulated-file.txt");
    answer = "File workflow simulated successfully in local demo mode.";
  }

  return {
    completed: true,
    answer,
    actions,
    thoughts,
    steps_taken: 3,
    elapsed_seconds: 2,
    model_used: "local-demo",
    tokens: 128,
  };
}

export function createLocalUpgradeResult(feedback: string) {
  return {
    success: true,
    new_version: "local-demo",
    improvement: feedback.trim(),
    message: "Local demo accepted your upgrade note and stored it for the future Groq-backed runtime.",
  };
}

export function streamLocalText(
  text: string,
  onToken: (chunk: string) => void,
  onDone: () => void,
  speed = 18
) {
  let index = 0;
  const timer = window.setInterval(() => {
    const chunk = text.slice(index, index + 1);
    index += 1;
    if (chunk) onToken(chunk);
    if (index >= text.length) {
      window.clearInterval(timer);
      onDone();
    }
  }, speed);

  return () => window.clearInterval(timer);
}
