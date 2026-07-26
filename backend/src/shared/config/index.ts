import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("localhost"),
  DATABASE_URL: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
  LOG_LEVEL: z.string().default("info"),
  LOW_STOCK_THRESHOLD: z.coerce.number().default(10),
  ADMIN_JWT_SECRET: z.string().default("gerai-one-admin-access-secret-key-2026"),
  ADMIN_JWT_REFRESH_SECRET: z.string().default("gerai-one-admin-refresh-secret-key-2026"),
  ADMIN_JWT_EXPIRES_IN: z.string().default("1d"),
  ADMIN_JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof envSchema>;
