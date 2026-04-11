import clsx from "clsx";
import type { SystemStatus } from "@/types/system.types";

type DotStatus = SystemStatus | "alert";

const STATUS_STYLES: Record<DotStatus, string> = {
  online: "bg-cyan",
  standby: "bg-violet",
  locked: "bg-danger",
  offline: "bg-white/30",
  alert: "bg-danger",
};

interface StatusDotProps {
  status: DotStatus;
  className?: string;
}

export default function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={clsx(
        "h-2 w-2 rounded-full",
        STATUS_STYLES[status],
        className
      )}
    />
  );
}
