import { inspectSponsor } from "../integrations/stellar/horizon-sponsorship.js";

const sponsorId = process.argv[2];
if (!sponsorId) {
  process.stderr.write("Usage: npm run proof:inspect -- G_SPONSOR_ADDRESS\n");
  process.exit(2);
}

inspectSponsor(sponsorId)
  .then((report) =>
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`),
  )
  .catch((error: unknown) => {
    process.stderr.write(
      `Inspection failed: ${error instanceof Error ? error.message : "Unknown error"}\n`,
    );
    process.exitCode = 1;
  });
