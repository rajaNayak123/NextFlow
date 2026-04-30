import { defineConfig } from "@trigger.dev/sdk/v3"

export default defineConfig({
  project: "nextflow-workflow-builder",
  dirs: ["./src/trigger"],
  maxDuration: 3600,
})
