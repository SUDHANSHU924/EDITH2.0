export type MessageRole = "user" | "assistant";

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
  source?: "camera" | "file";
  file?: File;
}

export interface Message {
  id: number;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  attachments?: Attachment[];
  kind?: "analysis" | "default";
  screenshot_base64?: string;
  action?: {
    type: string;
    params?: Record<string, unknown>;
  };
}
