type StreamHandlers = {
  onToken: (token: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
};

export async function streamEdithResponse(
  response: Response,
  handlers: StreamHandlers
) {
  if (!response.body) {
    handlers.onError?.(new Error("Missing response body"));
    handlers.onDone();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.replace("data:", "").trim();
        if (!payload) continue;
        if (payload === "[DONE]") {
          handlers.onDone();
          return;
        }
        try {
          const parsed = JSON.parse(payload) as { token?: string; content?: string; error?: string };
          const text = parsed.token ?? parsed.content ?? "";
          if (text) {
            handlers.onToken(text);
          }
        } catch {
          // Ignore malformed chunks.
        }
      }
    }
    handlers.onDone();
  } catch (error) {
    handlers.onError?.(error as Error);
    handlers.onDone();
  }
}
