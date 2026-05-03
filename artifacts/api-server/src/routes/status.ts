import { Router, type IRouter } from "express";

const router: IRouter = Router();

function configured(...values: Array<string | undefined>) {
  return values.some((value) => Boolean(value && value.trim()));
}

router.get("/orchestrator/status", (_req, res) => {
  res.json({
    status: "online",
    system: "00 - Orchestrator",
    groq_configured: configured(process.env.GROQ_API_KEY),
    nvidia_configured: configured(process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_CORE),
  });
});

router.get("/search/status", (_req, res) => {
  res.json({
    system: "05 - Deep Search",
    status: "online",
    configured: configured(process.env.TAVILY_API_KEY, process.env.GOOGLE_API_KEY),
    provider: process.env.TAVILY_API_KEY ? "tavily" : "google",
  });
});

router.get("/code/status", (_req, res) => {
  res.json({
    system: "03 - Code Forge",
    status: "online",
    configured: configured(process.env.NVIDIA_API_KEY, process.env.GROQ_API_KEY),
    provider: process.env.NVIDIA_API_KEY ? "nvidia" : "groq",
  });
});

router.get("/hacker/status", (_req, res) => {
  res.json({
    system: "14 - RESTRICTED",
    status: "locked",
  });
});

router.get("/satellite/status", (_req, res) => {
  res.json({
    system: "15 - CLASSIFIED",
    status: "locked",
  });
});

export default router;
