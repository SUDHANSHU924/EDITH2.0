export type SystemStatus = "online" | "standby" | "locked" | "offline";

export interface SystemModule {
  id: number;
  name: string;
  status: SystemStatus;
  description: string;
  route: string;
  locked?: boolean;
}

export interface SystemStat {
  label: string;
  value: string;
  accent?: "cyan" | "violet" | "red";
}

export type LogLevel = "info" | "warn" | "alert";

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  level?: LogLevel;
}
