import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./database/connection.js";
import { logger } from "./shared/logger.js";

async function start() {
  await connectDatabase();
  const server = createApp().listen(env.PORT, env.HOST, () => {
    logger.info({ host: env.HOST, port: env.PORT }, "ReserveOps API listening");
  });
  server.on("error", () => {
    logger.fatal("HTTP server failed to start; check the host and port");
    void disconnectDatabase().finally(() => process.exit(1));
  });
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    logger.info("Shutting down");
    const timeout = setTimeout(() => process.exit(1), 10_000);
    timeout.unref();
    server.close(() => {
      void disconnectDatabase()
        .then(() => {
          clearTimeout(timeout);
          process.exit(0);
        })
        .catch(() => process.exit(1));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch(() => {
  logger.fatal("Startup failed; check database connectivity and configuration");
  process.exit(1);
});
