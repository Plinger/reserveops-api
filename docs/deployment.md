# Deploy the ReserveOps testnet preview

The dashboard and API are separate repositories. A practical preview setup is a Vercel deployment of `reserveops-web` and a Render web service for `reserveops-api`. The browser calls the API over HTTPS; the API reads public Stellar testnet data from Horizon. MongoDB is not required for the current read-only preview.

## 1. Deploy the API on Render

In Render, select **New > Web Service**, connect the GitHub account with access to `Plinger/reserveops-api`, and choose that repository's `main` branch. Use the Node runtime. The repository's `.nvmrc` pins Node.js 24.

| Setting                | Value                                   |
| ---------------------- | --------------------------------------- |
| Build command          | `npm ci --include=dev && npm run build` |
| Start command          | `npm start`                             |
| HTTP health check path | `/ready`                                |

Set these environment variables in Render:

| Variable           | Value                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| `HOST`             | `0.0.0.0`                                                                       |
| `CORS_ORIGIN`      | Exact Vercel production origin, for example `https://reserveops-web.vercel.app` |
| `TRUST_PROXY_HOPS` | `1`                                                                             |
| `STELLAR_NETWORK`  | `testnet`                                                                       |
| `LOG_LEVEL`        | `info`                                                                          |

Render supplies `PORT` and sets `NODE_ENV=production` at runtime. Do not set `MONGODB_URI` for the preview. If the Vercel URL is not known yet, update `CORS_ORIGIN` after deploying the frontend. Use the production origin without a trailing slash. Vercel preview deployment URLs are different origins and are not covered by this single-origin setting.

The service will have an HTTPS URL such as `https://reserveops-api.onrender.com`. Check `GET /health` for liveness and `GET /ready` for `status: "ready"` and `database: "unconfigured"`. The preview route is `GET /v1/testnet/sponsors/{sponsorId}/inventory`. The public example sponsor in `docs/testnet-proof.md` can be used, but testnet resets may require a new fixture.

## 2. Connect the Vercel frontend

Deploy `Plinger/reserveops-web` as a Next.js project. In Vercel's project environment variables, set `NEXT_PUBLIC_API_URL` to the Render HTTPS origin, for example `https://reserveops-api.onrender.com`. Redeploy after adding or changing this variable because it is included in browser assets at build time. Do not put `MONGODB_URI` or other secrets in a `NEXT_PUBLIC_` variable.

Open the Vercel site and select **Inspect testnet example**. If the browser reports a CORS error, check that Render's `CORS_ORIGIN` exactly matches the Vercel page's origin, including the `https://` scheme and without a trailing slash.

## When persistent features are added

Create a MongoDB Atlas database user and add the Render service's outbound IP ranges to the Atlas project's IP access list. Store the connection URI as Render's `MONGODB_URI` secret, not in GitHub or Vercel. A configured but unreachable database causes API startup to fail. The current public preview contains no persisted business data.

The preview is testnet-only and has process-local rate limits. A free Render service can sleep while idle and take time to wake; use a paid service for a responsive production-facing demo. Before scaling to multiple API instances, move rate-limit state to a shared store.

## Platform references

- [Render Express deployment](https://render.com/docs/deploy-node-express-app)
- [Render web service port binding](https://render.com/docs/web-services#port-binding)
- [Render health checks](https://render.com/docs/health-checks)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [MongoDB Atlas connection prerequisites](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/)
