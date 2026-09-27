import type { Horizon } from "@stellar/stellar-sdk";
import { stroopsToXlm } from "../amounts/stroops.js";

export type SponsoredEntry = {
  kind: "account" | "trustline" | "signer";
  owner: string;
  asset?: string;
  signerKey?: string;
  signerType?: string;
  reserveUnits: number;
  reserveStroops: string;
  reserveXlm: string;
};

export function entriesFromAccount(
  account: {
    account_id: string;
    sponsor?: string;
    balances: Horizon.HorizonApi.BalanceLine[];
    signers: Array<{ key: string; type: string; sponsor?: string }>;
  },
  sponsor: string,
  baseReserveStroops: bigint,
): SponsoredEntry[] {
  const entries: SponsoredEntry[] = [];
  if (account.sponsor === sponsor) {
    entries.push({
      kind: "account",
      owner: account.account_id,
      reserveUnits: 2,
      reserveStroops: String(baseReserveStroops * 2n),
      reserveXlm: stroopsToXlm(baseReserveStroops * 2n),
    });
  }
  for (const balance of account.balances) {
    if (
      (balance.asset_type === "credit_alphanum4" ||
        balance.asset_type === "credit_alphanum12") &&
      balance.sponsor === sponsor
    ) {
      const asset = `${balance.asset_code}:${balance.asset_issuer}`;
      entries.push({
        kind: "trustline",
        owner: account.account_id,
        asset,
        reserveUnits: 1,
        reserveStroops: String(baseReserveStroops),
        reserveXlm: stroopsToXlm(baseReserveStroops),
      });
    }
  }
  for (const signer of account.signers) {
    if (signer.sponsor === sponsor) {
      entries.push({
        kind: "signer",
        owner: account.account_id,
        signerKey: signer.key,
        signerType: signer.type,
        reserveUnits: 1,
        reserveStroops: String(baseReserveStroops),
        reserveXlm: stroopsToXlm(baseReserveStroops),
      });
    }
  }
  return entries;
}

export function summarizeInventory(
  entries: SponsoredEntry[],
  sponsorReserveUnits: number,
  baseReserveStroops: bigint,
) {
  const explainedUnits = entries.reduce(
    (sum, entry) => sum + entry.reserveUnits,
    0,
  );
  const unaccountedUnits = sponsorReserveUnits - explainedUnits;
  return {
    accountCount: entries.filter((entry) => entry.kind === "account").length,
    trustlineCount: entries.filter((entry) => entry.kind === "trustline")
      .length,
    signerCount: entries.filter((entry) => entry.kind === "signer").length,
    explainedReserveUnits: explainedUnits,
    totalSponsorReserveUnits: sponsorReserveUnits,
    unaccountedReserveUnits: unaccountedUnits,
    explainedStroops: String(BigInt(explainedUnits) * baseReserveStroops),
    explainedXlm: stroopsToXlm(BigInt(explainedUnits) * baseReserveStroops),
    totalSponsorReserveStroops: String(
      BigInt(sponsorReserveUnits) * baseReserveStroops,
    ),
    totalSponsorReserveXlm: stroopsToXlm(
      BigInt(sponsorReserveUnits) * baseReserveStroops,
    ),
    coverage:
      unaccountedUnits === 0
        ? "reconciled"
        : unaccountedUnits > 0
          ? "partial"
          : "inconsistent",
  } as const;
}
