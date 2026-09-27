import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { databaseStatus } from "./database/connection.js";
import { logger } from "./shared/logger.js";
import { registerTestnetPreview } from "./modules/sponsors/testnet-preview.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (env.TRUST_PROXY_HOPS > 0) app.set("trust proxy", env.TRUST_PROXY_HOPS);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(pinoHttp({ logger }));
  app.get("/health", (_req, res) => {
    res.set("Cache-Control", "no-store").json({
      status: "ok",
      service: "reserveops-api",
      network: env.STELLAR_NETWORK,
    });
  });
  app.get("/ready", (_req, res) => {
    const database = databaseStatus();
    // The public testnet preview does not depend on MongoDB.
    const ready = database !== "disconnected";
    res
      .set("Cache-Control", "no-store")
      .status(ready ? 200 : 503)
      .json({ status: ready ? "ready" : "not_ready", database });
  });
  app.use(
    "/v1",
    rateLimit({
      windowMs: 60_000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  registerTestnetPreview(app);
  app.use((_req, res) =>
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Route not found" } }),
  );
  const errorHandler: ErrorRequestHandler = (
    error: unknown,
    req,
    res,
    _next,
  ) => {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number(error.status)
        : 500;
    if (status === 400 || status === 413) {
      res.status(status).json({
        error: {
          code: "INVALID_REQUEST",
          message:
            status === 413 ? "Request too large" : "Invalid request body",
        },
      });
      return;
    }
    req.log.error({ err: error }, "Request failed");
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
    });
  };
  app.use(errorHandler);
  return app;
}
