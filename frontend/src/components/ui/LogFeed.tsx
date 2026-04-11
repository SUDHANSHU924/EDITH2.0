import clsx from "clsx";
import type { LogEntry } from "@/types/system.types";

interface LogFeedProps {
  logs: LogEntry[];
}

const LEVEL_STYLE: Record<string, string> = {
  info: "text-white/70",
  warn: "text-danger",
  alert: "text-danger",
};

export default function LogFeed({ logs }: LogFeedProps) {
  return (
    <div className="space-y-2 text-xs">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3">
          <span className="text-white/40 font-mono">{log.time}</span>
          <span
            className={clsx(
              "flex-1",
              LEVEL_STYLE[log.level ?? "info"] ?? "text-white/70"
            )}
          >
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
}
