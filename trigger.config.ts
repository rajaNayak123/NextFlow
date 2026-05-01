import { defineConfig } from "@trigger.dev/sdk/v3"

export default defineConfig({
  project: "nextflow-workflow-builder",
  dirs: ["./src/trigger"],
  maxDuration: 3600,
  onStart: async () => {
    if (!process.env.TRIGGER_SECRET_KEY) {
      throw new Error("TRIGGER_SECRET_KEY is missing from environment variables.")
    }
  }
})
