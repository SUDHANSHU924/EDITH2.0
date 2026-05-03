/**
 * Vision analysis and file QA endpoints.
 * POST /api/vision/analyze  — analyze image attachments using the NVIDIA vision model
 * POST /api/files/qa        — answer questions about uploaded text files
 */
import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import OpenAI from "openai";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const NVIDIA_BASE_URL = process.env["NVIDIA_BASE_URL"] || "https://integrate.api.nvidia.com/v1";

function getClient(apiKey: string): OpenAI {
  return new OpenAI({ baseURL: NVIDIA_BASE_URL, apiKey });
}

function groqClient(): OpenAI {
  return new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env["GROQ_API_KEY"] || "",
  });
}

// ── VISION ANALYZE ────────────────────────────────────────────────────────────

router.post(
  "/vision/analyze",
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const prompt = (req.body.prompt as string) || "Describe what you see in this image.";

    if (!files.length) {
      res.json({ results: [] });
      return;
    }

    const imageFiles = files.filter((f) => f.mimetype.startsWith("image/"));
    if (!imageFiles.length) {
      res.json({ results: [], message: "No image files provided" });
      return;
    }

    const apiKey = process.env["NVIDIA_API_KEY_VISION"] || process.env["GROQ_API_KEY"] || "";
    if (!apiKey) {
      res.status(503).json({ error: "No vision API key configured" });
      return;
    }

    const results: { name: string; summary: string }[] = [];

    for (const file of imageFiles) {
      try {
        const b64 = file.buffer.toString("base64");
        const dataUrl = `data:${file.mimetype};base64,${b64}`;

        // Try NVIDIA vision model first, fall back to Groq (text-only fallback)
        try {
          const client = getClient(apiKey);
          const response = await client.chat.completions.create({
            model: "microsoft/phi-3.5-vision-instruct",
            messages: [
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: dataUrl } },
                  { type: "text", text: prompt },
                ] as never,
              },
            ],
            max_tokens: 400,
            temperature: 0.4,
          });
          results.push({ name: file.originalname, summary: response.choices[0]?.message?.content || "No description available." });
        } catch {
          // Groq doesn't support vision — return a placeholder
          results.push({ name: file.originalname, summary: `Image received (${file.mimetype}, ${Math.round(file.size / 1024)}KB). Vision analysis requires NVIDIA Vision API.` });
        }
      } catch (err) {
        results.push({ name: file.originalname, summary: `Analysis failed: ${err instanceof Error ? err.message : "Unknown error"}` });
      }
    }

    res.json({ results });
  }
);

// ── FILES QA ──────────────────────────────────────────────────────────────────

router.post(
  "/files/qa",
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const question = (req.body.question as string) || "Summarize the content of these files.";

    if (!files.length) {
      res.json({ answer: "No files provided.", sources: [] });
      return;
    }

    // Extract text from uploaded files
    const textParts: { name: string; text: string }[] = [];
    for (const file of files) {
      const isText = file.mimetype.startsWith("text/") ||
        /\.(txt|md|json|csv|log|py|ts|js|html|css|yaml|yml|xml|sh|env)$/i.test(file.originalname);
      if (isText) {
        textParts.push({ name: file.originalname, text: file.buffer.toString("utf-8").slice(0, 8000) });
      } else if (file.mimetype.startsWith("image/")) {
        textParts.push({ name: file.originalname, text: `[Image file: ${file.originalname}]` });
      } else {
        textParts.push({ name: file.originalname, text: `[Binary file: ${file.originalname}, ${Math.round(file.size / 1024)}KB]` });
      }
    }

    const combinedContent = textParts
      .map((p) => `=== ${p.name} ===\n${p.text}`)
      .join("\n\n");

    const systemPrompt = `You are EDITH FILE VAULT MODULE. You analyze file contents and answer questions about them accurately and concisely. Cite which file the information comes from when relevant.`;
    const userMessage = `Files provided:\n\n${combinedContent}\n\nQuestion: ${question}`;

    const apiKey = process.env["NVIDIA_API_KEY_FILES"] || process.env["GROQ_API_KEY"] || "";
    if (!apiKey) {
      res.status(503).json({ error: "No API key configured for file analysis" });
      return;
    }

    try {
      let answer = "";
      try {
        const client = getClient(apiKey);
        const response = await client.chat.completions.create({
          model: "meta/llama-3.3-70b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        });
        answer = response.choices[0]?.message?.content || "No answer generated.";
      } catch {
        // Fallback to Groq
        const groq = groqClient();
        const response = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 1024,
        });
        answer = response.choices[0]?.message?.content || "No answer generated.";
      }

      res.json({ answer, sources: textParts.map((p) => p.name) });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "File QA failed" });
    }
  }
);

// ── STATUS ────────────────────────────────────────────────────────────────────

router.get("/vision/status", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    model: "microsoft/phi-3.5-vision-instruct",
    configured: Boolean(process.env["NVIDIA_API_KEY_VISION"] || process.env["GROQ_API_KEY"]),
  });
});

router.get("/files/status", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    model: "meta/llama-3.3-70b-instruct",
    configured: Boolean(process.env["NVIDIA_API_KEY_FILES"] || process.env["GROQ_API_KEY"]),
  });
});

export default router;
