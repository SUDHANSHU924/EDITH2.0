import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import CodeBlock from "@/components/chat/CodeBlock";
import type { Message } from "@/types/message.types";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.timestamp).toLocaleTimeString();

  return (
    <div
      className={clsx(
        "flex flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[85%] rounded-lg px-4 py-3 text-sm",
          isUser
            ? "border border-cyan/40 bg-cyan/10 text-white"
            : "glass text-white/90",
          message.isStreaming && "animate-float"
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              code({ inline, className, children }) {
                const match = /language-(\w+)/.exec(className || "");
                if (!inline) {
                  return (
                    <CodeBlock
                      language={match?.[1]}
                      value={String(children).trimEnd()}
                    />
                  );
                }
                return (
                  <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
        {timestamp}
      </span>
    </div>
  );
}
