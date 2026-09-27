import { Horizon, StrKey } from "@stellar/stellar-sdk";
import {
  entriesFromAccount,
  summarizeInventory,
} from "../../domain/sponsorship/inventory.js";

export const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";

export async function inspectSponsor(
  sponsorId: string,
  options: { maxPages?: number } = {},
) {
  if (!StrKey.isValidEd25519PublicKey(sponsorId)) {
    throw new Error("Expected a Stellar G-address for the sponsor");
  }
  const horizonUrl = TESTNET_HORIZON_URL;
  const maxPages = options.maxPages ?? 10;
  if (!Number.isInteger(maxPages) || maxPages < 1)
    throw new Error("maxPages must be a positive integer");
  const server = new Horizon.Server(horizonUrl);
  const before = await server.root();
  const sponsorAccount = await server.loadAccount(sponsorId);
  const ledgerPage = await server.ledgers().order("desc").limit(1).call();
  const latestLedger = ledgerPage.records[0];
  if (!latestLedger) throw new Error("Horizon returned no ledgers");
  const baseReserveStroops = BigInt(latestLedger.base_reserve_in_stroops);
  const entries = [] as ReturnType<typeof entriesFromAccount>;
  let accountCount = 0;
  let pagesRead = 0;
  let truncated = false;
  let page = await server.accounts().sponsor(sponsorId).limit(200).call();
  for (;;) {
    pagesRead += 1;
    accountCount += page.records.length;
    for (const account of page.records) {
      entries.push(
        ...entriesFromAccount(account, sponsorId, baseReserveStroops),
      );
    }
    if (page.records.length < 200) break;
    if (pagesRead >= maxPages) {
      truncated = true;
      break;
    }
    page = await page.next();
  }
  const after = await server.root();
  const summary = summarizeInventory(
    entries,
    sponsorAccount.num_sponsoring,
    baseReserveStroops,
  );
  const moved = before.ingest_latest_ledger !== after.ingest_latest_ledger;
  const coverage = truncated
    ? "truncated"
    : moved
      ? "moving_ledger"
      : summary.coverage;
  return {
    network: "testnet" as const,
    sponsor: sponsorId,
    source: horizonUrl,
    observedAt: new Date().toISOString(),
    ledgerWindow: {
      start: before.ingest_latest_ledger,
      end: after.ingest_latest_ledger,
    },
    baseReserveLedger: latestLedger.sequence,
    baseReserveStroops: String(baseReserveStroops),
    pagesRead,
    accountsInspected: accountCount,
    truncated,
    entries,
    summary: { ...summary, coverage },
    limitations: [
      "Horizon pagination spans a moving ledger window; this is not an atomic snapshot.",
      "Only account, ordinary asset-trustline, and signer entries are itemized. Other sponsored types remain in unaccounted reserve units.",
      ...(moved
        ? [
            "Horizon advanced during this scan; reserve totals may reflect different ledgers.",
          ]
        : []),
      ...(truncated
        ? ["Account pagination reached the configured page limit."]
        : []),
    ],
  };
}
