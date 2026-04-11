import clsx from "clsx";

interface CyanBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function CyanBadge({ children, className }: CyanBadgeProps) {
  return (
    <span
      className={clsx(
        "border border-cyan/40 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan/80",
        className
      )}
    >
      {children}
    </span>
  );
}
