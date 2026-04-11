import clsx from "clsx";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassPanel({ children, className }: GlassPanelProps) {
  return <div className={clsx("glass rounded-lg", className)}>{children}</div>;
}
