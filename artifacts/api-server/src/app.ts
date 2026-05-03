import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { createProxyMiddleware } from "http-proxy-middleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

// Forward /api/jarvis/* /api/orchestrator/* /api/talk/* to FastAPI on port 9000.
// IMPORTANT: proxy routes must come BEFORE express.json() — body parsers consume
// the stream and the proxy would forward an empty body.
const JARVIS_PORT = process.env["JARVIS_PORT"] ?? "9000";

const jarvisErrorHandler = (err: unknown, _req: unknown, res: unknown) => {
  logger.warn({ err: (err as Error).message }, "Jarvis proxy error");
  const r = res as express.Response & { headersSent?: boolean };
  if (!r.headersSent) r.status(503).json({ error: "Jarvis service unavailable" });
};

app.use(
  "/api/jarvis",
  createProxyMiddleware({
    target: `http://127.0.0.1:${JARVIS_PORT}`,
    changeOrigin: false,
    pathRewrite: { "^/": "/api/jarvis/" },
    on: { error: jarvisErrorHandler },
  })
);

app.use(
  "/api/orchestrator",
  createProxyMiddleware({
    target: `http://127.0.0.1:${JARVIS_PORT}`,
    changeOrigin: false,
    ws: true,
    pathRewrite: (path: string) =>
      path.startsWith("/api/orchestrator") ? path : `/api/orchestrator${path}`,
    on: { error: jarvisErrorHandler },
  })
);

app.use(
  "/api/talk",
  createProxyMiddleware({
    target: `http://127.0.0.1:${JARVIS_PORT}`,
    changeOrigin: false,
    pathRewrite: { "^/": "/api/talk/" },
    on: { error: jarvisErrorHandler },
  })
);

app.use(
  "/api/desktop",
  createProxyMiddleware({
    target: `http://127.0.0.1:${JARVIS_PORT}`,
    changeOrigin: false,
    ws: true,
    pathRewrite: (path: string) =>
      path.startsWith("/api/desktop") ? path : `/api/desktop${path}`,
    on: { error: jarvisErrorHandler },
  })
);

// Body parsers only apply to local Express routes below
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
