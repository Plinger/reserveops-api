import type { Express } from "express";
import { rateLimit } from "express-rate-limit";
import { StrKey } from "@stellar/stellar-sdk";
import { inspectSponsor } from "../../integrations/stellar/horizon-sponsorship.js";

type Inspector = typeof inspectSponsor;

export function registerTestnetPreview(
  app: Express,
  inspector: Inspector = inspectSponsor,
) {
  const previewLimit = rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  app.get(
    "/v1/testnet/sponsors/:sponsorId/inventory",
    previewLimit,
    async (req, res) => {
      res.set("Cache-Control", "no-store");
      const sponsorId = req.params.sponsorId;
      if (
        typeof sponsorId !== "string" ||
        !StrKey.isValidEd25519PublicKey(sponsorId)
      ) {
        res.status(400).json({
          error: {
            code: "INVALID_SPONSOR",
            message: "Provide a valid Stellar G-address",
          },
        });
        return;
      }
      try {
        const report = await inspector(sponsorId, { maxPages: 2 });
        res.json(report);
      } catch (error: unknown) {
        const status =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "status" in error.response
            ? Number(error.response.status)
            : undefined;
        if (status === 404) {
          res.status(404).json({
            error: {
              code: "SPONSOR_NOT_FOUND",
              message: "Sponsor account does not exist on testnet",
            },
          });
          return;
        }
        req.log.error({ err: error }, "Testnet inventory preview failed");
        res.status(502).json({
          error: {
            code: "STELLAR_UNAVAILABLE",
            message: "Could not read Stellar testnet; retry later",
          },
        });
      }
    },
  );
}
