# API development

Use Node.js 24 and npm. Run npm ci on a clean clone, copy .env.example to .env once, then npm run dev.

## Environment

| Variable         | Default               | Purpose                                                |
| ---------------- | --------------------- | ------------------------------------------------------ |
| NODE_ENV         | development           | Runtime mode                                           |
| HOST             | 127.0.0.1             | Use 0.0.0.0 for containers                             |
| PORT             | 4000                  | HTTP port                                              |
| CORS_ORIGIN      | http://localhost:3100 | Browser origin                                         |
| LOG_LEVEL        | info                  | Pino log level                                         |
| MONGODB_URI      | unset                 | Local MongoDB or Atlas URI                             |
| STELLAR_NETWORK  | testnet               | Current supported network; preview always uses testnet |
| TRUST_PROXY_HOPS | 0                     | Number of trusted reverse-proxy hops for client IPs    |

The current preview can run without MongoDB in development or production. Without a URI, `/ready` returns 200 with `database: "unconfigured"` because the public preview does not use the database. If a URI is configured, startup requires a successful connection; a disconnected configured database makes readiness return 503. Set your own URI, e.g. mongodb://127.0.0.1:27017/reserveops, when database features are added. Never commit .env or reuse production credentials locally.

Leave `TRUST_PROXY_HOPS=0` for direct local connections. Set it to `1` only when the service runs behind a trusted single-hop reverse proxy such as Render, so rate limits use the client IP from the forwarded header.

## Commands

- npm run dev: tsx watch.
- npm run check: lint, typecheck, tests, build.
- npm run format / npm run format:check: Prettier.
- npm run build then npm start: compile and run dist/server.js.

## HTTP

GET /health returns 200 for process liveness.
GET /ready returns 200 when the preview is available with MongoDB connected or unconfigured, and 503 if a configured database is disconnected.
GET /v1/testnet/sponsors/{sponsorId}/inventory returns a bounded read-only preview from public testnet Horizon. It works without MongoDB and is limited to 10 requests per minute per client. It is not the future authenticated business scan API.
Unknown routes return JSON 404; invalid JSON and oversized bodies return structured errors.
Versioned routes have a process-local rate limit. CORS is not authentication.
Configure proxy trust deliberately on deployment. Use shared rate-limit storage for multiple instances.

SIGINT/SIGTERM close the listener and disconnect MongoDB. Ctrl+C stops foreground development on Windows.
Tests use an in-process app without real MongoDB. A real connection needs environment-specific verification.
