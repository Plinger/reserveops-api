# Contributing to ReserveOps API

ReserveOps is an open-source project in preparation. See [the architecture](docs/architecture.md), [the live proof](docs/testnet-proof.md), and [the proposed contributor backlog](docs/contributor-backlog.md) before choosing work.

## Local setup

Use Node.js 24 and npm. Run `npm ci`, copy `.env.example` to `.env`, and run `npm run dev`. MongoDB is optional for the current public testnet preview. Run `npm run check` and `npm run format:check` before opening a pull request.

The testnet fixture command, `npm run proof:fixture`, creates and submits public testnet transactions. Its random private keys stay in memory. The inspection command, `npm run proof:inspect -- G_ADDRESS`, is read-only. Tests should not depend on Friendbot or live Horizon unless they are explicitly marked as live integration checks.

## Making a change

1. Agree on an issue scope and acceptance criteria before implementation. For Wave work, wait for assignment through the approved repository's workflow.
2. Keep protocol calculations in `src/domain`, Horizon access in `src/integrations/stellar`, and HTTP code in `src/modules`.
3. Add a fixture or focused test for behavior that can change reserve totals or coverage. Include a live testnet demonstration when introducing a new sponsored entry type.
4. Update OpenAPI and public docs if the HTTP response changes.
5. In the pull request, describe the observed behavior, verification commands, and any unsupported entry types or ledger consistency limits.

Use exact integer stroops for all calculations. Reports must distinguish a sponsor's minimum-balance requirement from spendable balance and from customer assets. Do not add private keys or secret environment files to commits.

For now, the HTTP endpoint is a bounded testnet preview. Changes that expose organization data or mainnet scans require authentication and a separate design review.
