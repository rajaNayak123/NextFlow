import { task } from "@trigger.dev/sdk/v3"

export const sora = task({
  id: "sora-2",
  run: async (payload: any) => {
    const { prompt } = payload
    // Stub for Sora 2
    return {
      videoUrl: "https://v.ftcdn.net/06/18/85/65/700_F_618856557_u06W6S6X6S.mp4",
      response: "https://v.ftcdn.net/06/18/85/65/700_F_618856557_u06W6S6X6S.mp4"
    }
  }
})
