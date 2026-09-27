import "dotenv/config";
import { z } from "zod";

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    HOST: z.string().default("127.0.0.1"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    CORS_ORIGIN: z.url().default("http://localhost:3100"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    MONGODB_URI: z
      .string()
      .regex(/^mongodb(?:\+srv)?:\/\//)
      .optional(),
    STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production" && !value.MONGODB_URI) {
      context.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "Required in production",
      });
    }
  });

const result = schema.safeParse(process.env);
if (!result.success) {
  throw new Error(
    `Invalid environment configuration: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
  );
}
export const env = result.data;
