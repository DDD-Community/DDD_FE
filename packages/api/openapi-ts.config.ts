import { defineConfig } from "@hey-api/openapi-ts";

const apiDocsUrl = "https://admin.dddstudy.site/api-docs-json";
export default defineConfig([
  {
    input: {
      path: apiDocsUrl,
      include:
        "^(getAuthGoogle|getAuthGoogleCallback|refreshAuthToken|logoutAuth|deleteAuthWithdrawal)",
    },
    output: { path: "./src/generated/auth" },
  },
  {
    input: {
      path: apiDocsUrl,
      include:
        "^(createAdminCohort|deleteAdminCohortById|getAdminCohorts|updateAdminCohortById|updateAdminCohortPartsById|getCohortActive)",
    },
    output: { path: "./src/generated/cohort" },
  },
]);
