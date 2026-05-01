import { task } from "@trigger.dev/sdk/v3"

export const flux = task({
  id: "flux-2-pro",
  run: async (payload: any) => {
    const { prompt } = payload
    // Stub for Flux 2 Pro
    return {
      imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=60",
      response: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=60"
    }
  }
})
