import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.post("/voice/speak", (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  res.json({ status: "ok", text, method: "browser-tts" });
});

router.post("/voice/transcribe", (req: Request, res: Response) => {
  res.json({ status: "ok", transcript: "", method: "browser-stt" });
});

router.get("/voice/status", (_req: Request, res: Response) => {
  res.json({ status: "online", tts: "browser", stt: "browser" });
});

export default router;
