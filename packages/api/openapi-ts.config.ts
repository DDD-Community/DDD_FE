import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://admin.dddstudy.site/api-docs.json",
  output: {
    path: "./generated",
  },
  plugins: ["@hey-api/types", "@hey-api/client-fetch", { name: "@hey-api/schemas", type: "zod" }],
});
