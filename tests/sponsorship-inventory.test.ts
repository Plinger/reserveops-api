import { describe, expect, it } from "vitest";
import type { Horizon } from "@stellar/stellar-sdk";
import {
  entriesFromAccount,
  summarizeInventory,
} from "../src/domain/sponsorship/inventory.js";

const sponsor = "G".padEnd(56, "S");
const other = "G".padEnd(56, "O");
const owner = "G".padEnd(56, "A");
const balances = [
  { asset_type: "native", balance: "0.0000000" },
  {
    asset_type: "credit_alphanum4",
    asset_code: "TEST",
    asset_issuer: other,
    sponsor,
  },
  {
    asset_type: "credit_alphanum4",
    asset_code: "OTHER",
    asset_issuer: other,
    sponsor: other,
  },
] as Horizon.HorizonApi.BalanceLine[];

describe("sponsorship inventory", () => {
  it("counts account as two reserve units and only matching trustlines as one", () => {
    const entries = entriesFromAccount(
      { account_id: owner, sponsor, balances, signers: [] },
      sponsor,
      5_000_000n,
    );
    expect(entries.map((entry) => entry.kind)).toEqual([
      "account",
      "trustline",
    ]);
    expect(entries.map((entry) => entry.reserveStroops)).toEqual([
      "10000000",
      "5000000",
    ]);
    expect(summarizeInventory(entries, 3, 5_000_000n)).toMatchObject({
      explainedReserveUnits: 3,
      totalSponsorReserveUnits: 3,
      unaccountedReserveUnits: 0,
      explainedXlm: "1.5000000",
      coverage: "reconciled",
    });
  });

  it("leaves non-itemized sponsor commitments visible", () => {
    const entries = entriesFromAccount(
      { account_id: owner, balances, signers: [] },
      sponsor,
      5_000_000n,
    );
    expect(entries).toHaveLength(1);
    expect(summarizeInventory(entries, 4, 5_000_000n)).toMatchObject({
      explainedReserveUnits: 1,
      unaccountedReserveUnits: 3,
      coverage: "partial",
    });
  });

  it("counts a sponsored additional signer once", () => {
    const entries = entriesFromAccount(
      {
        account_id: owner,
        balances: [],
        signers: [
          { key: other, type: "ed25519_public_key", sponsor },
          { key: owner, type: "ed25519_public_key" },
        ],
      },
      sponsor,
      5_000_000n,
    );
    expect(entries).toMatchObject([
      { kind: "signer", reserveUnits: 1, signerKey: other },
    ]);
  });

  it("flags an explained count greater than the sponsor's current count", () => {
    const entries = entriesFromAccount(
      { account_id: owner, sponsor, balances: [], signers: [] },
      sponsor,
      5_000_000n,
    );
    expect(summarizeInventory(entries, 1, 5_000_000n)).toMatchObject({
      unaccountedReserveUnits: -1,
      coverage: "inconsistent",
    });
  });
});
