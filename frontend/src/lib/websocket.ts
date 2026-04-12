type MessageHandler = (data: unknown) => void;

const resolveDefaultWsUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl;

  if (typeof window === "undefined") {
    return "ws://localhost:8000";
  }

  const { protocol, hostname, port } = window.location;
  const wsProtocol = protocol === "https:" ? "wss:" : "ws:";

  const isGithubDevHost =
    hostname.endsWith(".app.github.dev") ||
    hostname.endsWith(".preview.app.github.dev") ||
    hostname.endsWith(".githubpreview.dev");

  if (isGithubDevHost) {
    const prefixMatch = hostname.match(/^(\d+)-(.+)$/);
    if (prefixMatch) {
      return `${wsProtocol}//8000-${prefixMatch[2]}`;
    }

    const updatedHost = hostname.replace(
      /-\d+(?=(?:\.preview)?\.app\.github\.dev$|\.githubpreview\.dev$)/,
      "-8000"
    );
    if (updatedHost !== hostname) {
      return `${wsProtocol}//${updatedHost}`;
    }
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${wsProtocol}//${hostname}:8000`;
  }

  if (port) {
    return `${wsProtocol}//${hostname}:8000`;
  }

  return `${wsProtocol}//${hostname}`;
};

export class EDITHWebSocket {
  private socket: WebSocket | null = null;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect(onMessage: MessageHandler) {
    if (this.socket) return;
    const baseUrl = resolveDefaultWsUrl().replace(/\/$/, "");
    this.socket = new WebSocket(`${baseUrl}/ws/${this.sessionId}`);

    this.socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        onMessage(event.data);
      }
    };
  }

  send(data: object) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  }
}
