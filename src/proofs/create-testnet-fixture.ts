import {
  Asset,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  inspectSponsor,
  TESTNET_HORIZON_URL,
} from "../integrations/stellar/horizon-sponsorship.js";

const server = new Horizon.Server(TESTNET_HORIZON_URL);
const sponsor = Keypair.random();
const issuer = Keypair.random();
const sponsoredAccount = Keypair.random();
const selfFundedAccount = Keypair.random();
const extraSigner = Keypair.random();

async function fundAccount(address: string) {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`,
    {
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok)
    throw new Error(`Testnet Friendbot returned HTTP ${response.status}`);
}

async function buildAndSubmit(
  operations: ReturnType<typeof Operation.beginSponsoringFutureReserves>[],
  signer: typeof sponsoredAccount,
) {
  const source = await server.loadAccount(sponsor.publicKey());
  const fee = await server.fetchBaseFee();
  const builder = new TransactionBuilder(source, {
    fee: String(fee),
    networkPassphrase: Networks.TESTNET,
  });
  for (const operation of operations) builder.addOperation(operation);
  const transaction = builder.setTimeout(60).build();
  transaction.sign(sponsor, signer);
  return server.submitTransaction(transaction);
}

async function main() {
  process.stdout.write(
    "Funding ephemeral testnet sponsor, issuer, and one self-funded customer…\n",
  );
  await fundAccount(sponsor.publicKey());
  await fundAccount(issuer.publicKey());
  await fundAccount(selfFundedAccount.publicKey());
  const asset = new Asset("RTEST", issuer.publicKey());

  const first = await buildAndSubmit(
    [
      Operation.beginSponsoringFutureReserves({
        sponsoredId: sponsoredAccount.publicKey(),
        source: sponsor.publicKey(),
      }),
      Operation.createAccount({
        destination: sponsoredAccount.publicKey(),
        startingBalance: "0",
        source: sponsor.publicKey(),
      }),
      Operation.changeTrust({ asset, source: sponsoredAccount.publicKey() }),
      Operation.setOptions({
        signer: { ed25519PublicKey: extraSigner.publicKey(), weight: 1 },
        source: sponsoredAccount.publicKey(),
      }),
      Operation.endSponsoringFutureReserves({
        source: sponsoredAccount.publicKey(),
      }),
    ],
    sponsoredAccount,
  );
  const second = await buildAndSubmit(
    [
      Operation.beginSponsoringFutureReserves({
        sponsoredId: selfFundedAccount.publicKey(),
        source: sponsor.publicKey(),
      }),
      Operation.changeTrust({ asset, source: selfFundedAccount.publicKey() }),
      Operation.endSponsoringFutureReserves({
        source: selfFundedAccount.publicKey(),
      }),
    ],
    selfFundedAccount,
  );

  const report = await inspectSponsor(sponsor.publicKey());
  const fixture = {
    network: "testnet",
    sponsor: sponsor.publicKey(),
    issuer: issuer.publicKey(),
    sponsoredAccount: sponsoredAccount.publicKey(),
    selfFundedAccount: selfFundedAccount.publicKey(),
    asset: `RTEST:${issuer.publicKey()}`,
    transactionHashes: [first.hash, second.hash],
    expected: { accounts: 1, trustlines: 2, signers: 1, reserveUnits: 5 },
    observed: {
      accounts: report.summary.accountCount,
      trustlines: report.summary.trustlineCount,
      signers: report.summary.signerCount,
      explainedReserveUnits: report.summary.explainedReserveUnits,
      totalSponsorReserveUnits: report.summary.totalSponsorReserveUnits,
      ledgerWindow: report.ledgerWindow,
      coverage: report.summary.coverage,
    },
  };
  process.stdout.write(`${JSON.stringify(fixture, null, 2)}\n`);
  if (
    report.summary.accountCount !== 1 ||
    report.summary.trustlineCount !== 2 ||
    report.summary.signerCount !== 1 ||
    report.summary.explainedReserveUnits !== 5 ||
    report.summary.totalSponsorReserveUnits !== 5 ||
    report.summary.coverage !== "reconciled"
  ) {
    throw new Error(
      "Fixture did not reconcile with Horizon's current sponsor counters",
    );
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `Fixture failed: ${error instanceof Error ? error.message : "Unknown error"}\n`,
  );
  process.stderr.write(
    `Public addresses for inspection: sponsor=${sponsor.publicKey()} account=${sponsoredAccount.publicKey()} other=${selfFundedAccount.publicKey()}\n`,
  );
  process.exitCode = 1;
});
