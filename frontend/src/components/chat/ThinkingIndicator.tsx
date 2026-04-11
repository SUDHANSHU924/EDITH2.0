export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-cyan/70">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-cyan" />
        <span
          className="h-2 w-2 rounded-full bg-cyan/70 animate-pulse-cyan"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-cyan/50 animate-pulse-cyan"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      Processing
    </div>
  );
}
