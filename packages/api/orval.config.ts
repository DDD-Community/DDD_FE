import { defineConfig } from "orval";

export default defineConfig({
  ddd: {
    input: {
      target: "http://localhost:3000/api-docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/generated",
      override: {
        mutator: {
          path: "./src/mutator.ts",
          name: "apiFetch",
        },
      },
    },
  },
});
