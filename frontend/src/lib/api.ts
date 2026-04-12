import type { DepartmentId } from "@/departments";

export type BackendSystem =
  | "edith"
  | "planning"
  | "code"
  | "files"
  | "search"
  | "learning"
  | "ml"
  | "iot"
  | "vision"
  | "voice"
  | "memory"
  | "personal"
  | "security"
  | "daily"
  | "hacker"
  | "satellite";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequest = {
  messages: ChatMessage[];
  session_id: string;
  system_id: number;
  department: string;
};

const resolveDefaultApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }
  return "";
};

const buildUrl = (path: string) => {
  const baseUrl = resolveDefaultApiUrl();
  if (!path.startsWith("/")) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}${path}`;
};

const DEPARTMENT_TO_BACKEND: Record<DepartmentId, string> = {
  core: "core",
  agent: "planning",
  code: "code",
  files: "files",
  search: "search",
  learn: "learning",
  data: "ml",
  iot: "iot",
  vision: "vision",
  voice: "voice",
  personal: "personal",
  security: "security",
  daily: "daily",
  hacker: "hacker",
  satellite: "satellite",
};

const resolveDepartment = (department: DepartmentId | string) => {
  if (!department) return "core";
  return DEPARTMENT_TO_BACKEND[department as DepartmentId] ?? department;
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildUrl("/health"), {
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json().catch(() => null);
    return Boolean(data?.status);
  } catch {
    return false;
  }
};

export const sendToEDITH = async (
  content: string,
  department: DepartmentId | string,
  sessionId: string,
  history?: ChatMessage[]
): Promise<ReadableStream<Uint8Array> | null> => {
  const userMessage: ChatMessage = { role: "user", content };
  const messages = history?.length ? history : [userMessage];
  const payload: ChatRequest = {
    messages,
    session_id: sessionId,
    system_id: 1,
    department: resolveDepartment(department),
  };

  let response: Response;
  try {
    response = await fetch(buildUrl("/api/edith/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("EDITH request failed:", error);
    return null;
  }

  if (!response.ok || !response.body) {
    return null;
  }

  return response.body;
};

const SYSTEM_STATUS_PATHS: Record<BackendSystem, string> = {
  edith: "/api/edith/status",
  planning: "/api/planning/status",
  code: "/api/code/status",
  files: "/api/files/status",
  search: "/api/search/status",
  learning: "/api/learning/status",
  ml: "/api/ml/status",
  iot: "/api/iot/status",
  vision: "/api/vision/status",
  voice: "/api/voice/status",
  memory: "/api/memory/status",
  personal: "/api/personal/status",
  security: "/api/security/status",
  daily: "/api/daily/status",
  hacker: "/api/hacker/status",
  satellite: "/api/satellite/status",
};

export const fetchSystemStatus = async (system: BackendSystem) => {
  const response = await fetch(buildUrl(SYSTEM_STATUS_PATHS[system]), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch status for ${system}`);
  }

  return response.json();
};

export const decomposeObjective = async (
  objective: string,
  sessionId = "default"
) => {
  const response = await fetch(buildUrl("/api/planning/decompose"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objective, session_id: sessionId }),
  });

  if (!response.ok) {
    throw new Error("Planning request failed");
  }

  return response.json();
};

export const createFile = async (
  type: string,
  content: string,
  filename = "document"
) => {
  const response = await fetch(buildUrl("/api/files/create"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, content, filename }),
  });

  if (!response.ok) {
    throw new Error("File creation request failed");
  }

  return response.json();
};

export const updateLearning = async () => {
  const response = await fetch(buildUrl("/api/learning/update"), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Learning update request failed");
  }

  return response.json();
};

type VisionResult = {
  name: string;
  summary: string;
};

type FileQaResult = {
  answer: string;
  sources?: string[];
};

export const analyzeVision = async (files: File[], prompt: string) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file, file.name));
  formData.append("prompt", prompt);

  const response = await fetch(buildUrl("/api/vision/analyze"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Vision request failed");
  }

  const data = (await response.json()) as { results?: VisionResult[] };
  return data.results ?? [];
};

export const analyzeFiles = async (files: File[], question: string) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file, file.name));
  formData.append("question", question);

  const response = await fetch(buildUrl("/api/files/qa"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File QA request failed");
  }

  return (await response.json()) as FileQaResult;
};
