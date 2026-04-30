import { configure } from "@trigger.dev/sdk/v3";

configure({
  secretKey: process.env.TRIGGER_SECRET_KEY,
  baseURL: process.env.TRIGGER_API_URL,
});

export * from "@trigger.dev/sdk/v3";
