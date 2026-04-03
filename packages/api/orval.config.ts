import { defineConfig } from "orval";

export default defineConfig({
  ddd: {
    input: {
      target: "https://admin.dddstudy.site/api-docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/generated",
      schemas: "./src/generated/models",
      override: {
        mutator: {
          path: "./src/mutator.ts",
          name: "mutator",
        },
      },
    },
  },
});
