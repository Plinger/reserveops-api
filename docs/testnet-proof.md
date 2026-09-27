# Sponsored-reserve discovery proof

## Result

On 2026-09-27, the fixture script created a sponsor, an issuer, a zero-XLM customer account sponsored for its account reserve and RTEST trustline, and a separately funded customer whose RTEST trustline is sponsored. All keys were generated in memory; only public addresses and transaction hashes were printed. The fixture runs on Stellar testnet.

- Sponsor: `GAPFN3NHMNUEENMTGW3H2AH6D5NSBE6BU6SRU4RFOR3XIMK3MHO6LESH`
- Sponsored account: `GD524U563EMYCZ4BJ6ONRQETCL6CS3QGX7CIQCOKCJSMMOV4N5L2SYDW`
- Separately funded account: `GD2DEQMQMAEKMIL6XVS5TCOSMO4FHNQVB4ATF7LZNPGOJLRBFKFCYXPD`
- Asset issuer: `GALQVKHDP6VQRFK2Z3YVNNUBW42RJCTAZJWHN4EQG4OTMSXQYG7MXVFG`
- Sponsored-account transaction: `fc43e59b7d5c7cd3eb00f3f7d1f05a0fab7bdc410de11ac3058628c104e68b3e`
- Sponsored-trustline transaction: `68d35ad5029ad9190f8becdd5ca1255839c18e4cc3c6bb1e5575aa72e625e2f1`

The [checked-in report](fixtures/2026-09-27-testnet-report.json) found one account sponsorship (two reserve units) and two trustline sponsorships (one unit each). The sponsor's Horizon account record reported `num_sponsoring = 4`. The current base reserve was 5,000,000 stroops, so both methods indicated a 20,000,000-stroop (2 XLM) minimum-balance commitment. This is committed balance on the sponsor, not funds paid to the customer.

The report observed Horizon ledger 4,901,095 during its read. Testnet can reset and fixture accounts can disappear; run the fixture script again to recreate equivalent evidence.

## Signer extension and live preview

A second fixture created a sponsored additional signer alongside the account and two trustlines. Sponsor `GAJTATXHDK44KZDJ3345E67GUFYJXRUPVMOMP37JFL7NHCXEOUFQS2AB` had five sponsored reserve units, and ReserveOps explained all five: two for the account, two for the trustlines, and one for the signer. At the observed 5,000,000-stroop base reserve, that is 25,000,000 stroops (2.5 XLM) committed. The public transactions are `c0f061ba59d8bf694dcb5cd46e476e05652fcf3e0d37cdc6fd439d09861b555c` and `e3288a7cbbd9255b8889aadefc8c53170aad75a05c2a127cb73b311487034498`. See the [signer report](fixtures/2026-09-27-testnet-signer-report.json).

The running API returned HTTP 200 for `GET /v1/testnet/sponsors/GAJTATXHDK44KZDJ3345E67GUFYJXRUPVMOMP37JFL7NHCXEOUFQS2AB/inventory`, with the same five-unit summary. It returned HTTP 400 for an invalid address. This preview is bounded to two account pages and has its own request limit. It reads public testnet data without MongoDB. It does not establish eligibility to revoke sponsorship.

On 2026-09-27 at 18:28 UTC, `npm run proof:inspect -- GAJTATXHDK44KZDJ3345E67GUFYJXRUPVMOMP37JFL7NHCXEOUFQS2AB` still found the four itemized entries and five sponsored reserve units. Horizon advanced from ledger 4,902,023 to 4,902,026 during that inspection, so the result correctly reported `moving_ledger` instead of presenting the observation as an atomic snapshot.

## Reproduce

Use Node.js 24 and `npm ci` in `reserveops-api`. The fixture creates testnet accounts and submits two testnet transactions. No private key is written to disk.

```powershell
npm run proof:fixture
npm run proof:inspect -- GAPFN3NHMNUEENMTGW3H2AH6D5NSBE6BU6SRU4RFOR3XIMK3MHO6LESH
```

The first command creates new random accounts each time and prints their public addresses. To inspect a new run, use the sponsor printed by that command in the second command. Inspection is read-only and prints JSON.

The scripts use Stellar testnet Horizon and Friendbot. They do not use MongoDB or the HTTP server. A failed Friendbot request or Horizon connection stops the fixture and prints the public addresses for inspection. Testnet changes may affect the public sample.

## Discovery method

The SDK's `accounts().sponsor(address)` query returns accounts whose account entry or subentries are currently sponsored by the address. For each account, ReserveOps checks the current `sponsor` field on the account, its ordinary asset balances, and additional signers. It only includes exact sponsor matches. The latest Horizon ledger supplies the base reserve; the sponsor account's `num_sponsoring` supplies a cross-check. Pagination stops at an explicit page limit and reports `truncated` if reached.

## Limits to resolve

Horizon pages can be read across different ledgers; the report gives a ledger window and does not claim an atomic snapshot. A busy sponsor may change during pagination. The current proof itemizes accounts, ordinary trustlines, and additional signers. Offers, data entries, liquidity-pool trustlines and claimable balances need separate work. A zero `unaccountedReserveUnits` reconciles the known testnet fixtures; other sponsors may have unaccounted units. A negative count indicates inconsistent observations and must not be treated as releasable XLM. The proof does not determine whether any entry can be revoked, and it prepares no transaction.

## Sources

- [Horizon accounts sponsor filter](https://developers.stellar.org/docs/data/apis/horizon/api-reference/list-all-accounts)
- [Horizon account fields](https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/accounts/object)
- [Stellar sponsored reserves](https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves)
- [Ledger base reserve](https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/ledgers/object)
