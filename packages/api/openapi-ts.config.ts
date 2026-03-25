import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json", // 백엔드 OpenAPI 스펙 파일 (또는 URL)
  output: {
    path: "./generated",
    format: "prettier",
  },
  plugins: [
    "@hey-api/client-fetch",
    { name: "@hey-api/schemas", type: "zod" },
  ],
});
