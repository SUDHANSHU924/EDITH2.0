"use client";

import { useCallback } from "react";
import { analyzeFiles, analyzeVision, sendToEDITH } from "@/lib/api";
import { streamEdithResponse } from "@/hooks/useStream";
import { useChatStore } from "@/store/chatStore";
import type { Attachment } from "@/types/message.types";

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const buildAttachmentNote = (attachments?: Attachment[]) => {
  if (!attachments?.length) return "";
  const lines = attachments.map(
    (attachment) => `- ${attachment.name} (${formatBytes(attachment.size)})`
  );
  return `\n\n[ATTACHMENTS]\n${lines.join("\n")}`;
};

const buildVisionSummary = (results: { name: string; summary: string }[]) => {
  if (!results.length) return "No images analyzed.";
  const lines = results.map((result) => `- ${result.name}: ${result.summary}`);
  return lines.join("\n");
};

const buildFileSummary = (answer: string, sources?: string[]) => {
  const sourceLine = sources?.length ? `Sources: ${sources.join(", ")}` : "Sources: n/a";
  return `${answer}\n${sourceLine}`;
};

const buildAnalysisContent = (label: string, body: string) =>
  `${label}\n${body}`;

const buildAnalysisNote = (title: string, content: string) => {
  if (!content) return "";
  return `\n\n[${title}]\n${content}`;
};

export function useEdith(sessionId: string = "default", department: string = "core") {
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToMessage = useChatStore((state) => state.appendToMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const setThinking = useChatStore((state) => state.setThinking);
  const isThinking = useChatStore((state) => state.isThinking);
  const setCurrentDepartment = useChatStore((state) => state.setCurrentDepartment);

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      const trimmed = content.trim();
      if (!trimmed && !attachments?.length) return;

      setCurrentDepartment(department);

      const timestamp = new Date().toISOString();
      const displayContent = trimmed || "Attached files.";
      addMessage({ role: "user", content: displayContent, timestamp, attachments }, department);

      const history = useChatStore
        .getState()
        .getMessages(department)
        .filter(
          (message) => message.content && !message.isStreaming && message.kind !== "analysis"
        )
        .slice(-20)
        .map((message) => ({
          role: message.role,
          content: message.content + buildAttachmentNote(message.attachments),
        }));

      setThinking(true);
      let assistantId: number | null = null;

      try {
        const attachmentNote = buildAttachmentNote(attachments);
        const analysisNotes: string[] = [];

        const imageAttachments = attachments?.filter(
          (attachment) => attachment.file && attachment.type.startsWith("image/")
        );
        const fileAttachments = attachments?.filter(
          (attachment) => attachment.file && !attachment.type.startsWith("image/")
        );

        let visionMessageId: number | null = null;
        if (imageAttachments?.length) {
          visionMessageId = addMessage({
            role: "assistant",
            content: "Analyzing images...",
            timestamp: new Date().toISOString(),
            kind: "analysis",
          }, department);
        }

        let fileMessageId: number | null = null;
        if (fileAttachments?.length) {
          fileMessageId = addMessage({
            role: "assistant",
            content: "Analyzing files...",
            timestamp: new Date().toISOString(),
            kind: "analysis",
          }, department);
        }

        if (imageAttachments?.length) {
          const visionResults: { name: string; summary: string }[] = [];
          for (const attachment of imageAttachments) {
            try {
              const results = await analyzeVision(
                [attachment.file!],
                trimmed || "Describe the image."
              );
              if (results.length) {
                visionResults.push(...results);
                if (visionMessageId !== null) {
                  updateMessage(visionMessageId, {
                    content: buildAnalysisContent(
                      "VISION ANALYSIS",
                      buildVisionSummary(visionResults)
                    ),
                  }, department);
                }
              }
            } catch (error) {
              console.warn("Vision analysis failed:", error);
            if (visionMessageId !== null) {
              updateMessage(visionMessageId, {
                content: buildAnalysisContent(
                  "VISION ANALYSIS",
                  "Unable to analyze images."
                ),
              }, department);
            }
            }
          }

          if (visionResults.length) {
          analysisNotes.push(
            buildAnalysisNote(
              "VISION ANALYSIS",
              buildVisionSummary(visionResults)
            )
          );
          }
        }

        if (fileAttachments?.length) {
          try {
            const files = fileAttachments.map((attachment) => attachment.file!);
            const result = await analyzeFiles(
              files,
              trimmed || "Summarize the files."
            );
            const fileSummary = buildFileSummary(result.answer, result.sources);
            if (fileMessageId !== null) {
              updateMessage(fileMessageId, {
                content: buildAnalysisContent("FILE QA", fileSummary),
              }, department);
            }
            analysisNotes.push(buildAnalysisNote("FILE QA", fileSummary));
          } catch (error) {
            console.warn("File QA failed:", error);
            if (fileMessageId !== null) {
              updateMessage(fileMessageId, {
                content: buildAnalysisContent("FILE QA", "Unable to analyze files."),
              }, department);
            }
          }
        }

        const streamMessageId = addMessage({
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        }, department);
        assistantId = streamMessageId;

        const analysisContext = analysisNotes.length ? analysisNotes.join("") : "";
        const payloadContent = displayContent + attachmentNote + analysisContext;
        const stream = await sendToEDITH(
          payloadContent,
          department,
          sessionId,
          history
        );
        
        if (!stream) {
          updateMessage(streamMessageId, {
            content: "EDITH backend unavailable.",
            isStreaming: false,
          }, department);
          setThinking(false);
          return;
        }

        await streamEdithResponse(new Response(stream), {
          onToken: (token) => appendToMessage(streamMessageId, token, department),
          onDone: () => {
            updateMessage(streamMessageId, { isStreaming: false }, department);
            setThinking(false);
          },
          onError: () => {
            updateMessage(streamMessageId, {
              content: "Signal lost. Re-establish and retry.",
              isStreaming: false,
            }, department);
            setThinking(false);
          },
        });
      } catch (error) {
        console.error("useEdith error:", error);
        if (assistantId === null) {
          addMessage({
            role: "assistant",
            content: "EDITH backend unavailable.",
            timestamp: new Date().toISOString(),
            isStreaming: false,
          }, department);
        } else {
          updateMessage(assistantId, {
            content: "EDITH backend unavailable.",
            isStreaming: false,
          }, department);
        }
        setThinking(false);
      }
    },
    [addMessage, appendToMessage, updateMessage, setThinking, sessionId, department, setCurrentDepartment]
  );

  return { sendMessage, isThinking };
}
