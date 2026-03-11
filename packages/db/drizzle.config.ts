import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

// apps/admin/.env.local에서 DATABASE_URL 로드
dotenv.config({
  path: path.resolve(__dirname, "../../apps/admin/.env.local"),
});

export default defineConfig({
  schema: "./schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
