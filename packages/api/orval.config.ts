import { defineConfig } from "orval";

export default defineConfig({
  ddd: {
    input: {
      target: "https://admin.dddstudy.kr/api-docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/generated",
      override: {
        mutator: {
          path: "./src/client.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
