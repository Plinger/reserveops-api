# API development

Use Node.js 24 and npm. Run npm ci on a clean clone, copy .env.example to .env once, then npm run dev.

## Environment

| Variable        | Default               | Purpose                                                |
| --------------- | --------------------- | ------------------------------------------------------ |
| NODE_ENV        | development           | Production requires MongoDB                            |
| HOST            | 127.0.0.1             | Use 0.0.0.0 for containers                             |
| PORT            | 4000                  | HTTP port                                              |
| CORS_ORIGIN     | http://localhost:3100 | Browser origin                                         |
| LOG_LEVEL       | info                  | Pino log level                                         |
| MONGODB_URI     | unset                 | Local MongoDB or Atlas URI                             |
| STELLAR_NETWORK | testnet               | Current supported network; preview always uses testnet |

Set your own MongoDB URI, e.g. mongodb://127.0.0.1:27017/reserveops. An unreachable configured database fails startup. Unconfigured development mode starts but readiness returns 503. Production requires a URI. Never commit .env or reuse production credentials locally.

## Commands

- npm run dev: tsx watch.
- npm run check: lint, typecheck, tests, build.
- npm run format / npm run format:check: Prettier.
- npm run build then npm start: compile and run dist/server.js.

## HTTP

GET /health returns 200 for process liveness.
GET /ready returns 200 when MongoDB is connected, otherwise 503.
GET /v1/testnet/sponsors/{sponsorId}/inventory returns a bounded read-only preview from public testnet Horizon. It works without MongoDB and is limited to 10 requests per minute per client. It is not the future authenticated business scan API.
Unknown routes return JSON 404; invalid JSON and oversized bodies return structured errors.
Versioned routes have a process-local rate limit. CORS is not authentication.
Configure proxy trust deliberately on deployment. Use shared rate-limit storage for multiple instances.

SIGINT/SIGTERM close the listener and disconnect MongoDB. Ctrl+C stops foreground development on Windows.
Tests use an in-process app without real MongoDB. A real connection needs environment-specific verification.
