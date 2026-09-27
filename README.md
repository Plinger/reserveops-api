# ReserveOps API

ReserveOps helps Stellar wallet and payment teams inspect the XLM reserve committed to sponsored ledger entries. This Express/TypeScript service currently offers a read-only **testnet preview**: given a public sponsor address, it itemizes sponsored accounts, ordinary trustlines, and additional signers, then compares those entries with the sponsor's total reported by Horizon.

This is an early preview. It does not determine whether sponsorship can be revoked or prepare transactions. Other ledger entry types and cross-ledger consistency checks remain in the [contributor backlog](docs/contributor-backlog.md).

The [dashboard](https://github.com/Plinger/reserveops-web) is maintained separately. External integrations use this API; there is no duplicate API repository.

## Run locally

Requires Node.js 24 and npm.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Skip the copy if the local environment file already exists.

- [Architecture and project plan](docs/architecture.md)
- [Development and configuration](docs/development.md)
- [Live testnet proof](docs/testnet-proof.md)
- [Proposed contributor backlog](docs/contributor-backlog.md)
- [Contributor guide](CONTRIBUTING.md)
- [Current OpenAPI contract](docs/openapi.yaml)

Run npm run check for the validation pipeline and npm run format:check for formatting.
Production: npm run build then npm start.
Liveness: http://localhost:4000/health. Readiness: http://localhost:4000/ready. Without MongoDB configured, development starts but readiness is 503. See [OpenAPI](docs/openapi.yaml).

Run `npm run proof:fixture` to create and verify a fresh testnet sponsor fixture. Run `npm run proof:inspect -- G_ADDRESS` to inspect an existing testnet sponsor. These scripts are independent of MongoDB and the HTTP server.

The read-only preview endpoint is `GET /v1/testnet/sponsors/{sponsorId}/inventory`. It uses public Stellar testnet data and does not require MongoDB. Its response includes reserve totals, itemized entries, ledger window, and coverage limitations; see the [OpenAPI contract](docs/openapi.yaml).

To contribute, read [CONTRIBUTING.md](CONTRIBUTING.md) and the [open issues](https://github.com/Plinger/reserveops-api/issues). The [backlog](docs/contributor-backlog.md) also tracks work that has not been opened as an issue yet.
