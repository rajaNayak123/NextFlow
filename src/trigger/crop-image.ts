import { task, wait } from "@trigger.dev/sdk"
import { z } from "zod"

export const cropImage = task({
  id: "crop-image",
  schema: z.object({
    imageUrl: z.string().url(),
    x: z.number().min(0).max(100).default(0),
    y: z.number().min(0).max(100).default(0),
    width: z.number().min(1).max(100).default(100),
    height: z.number().min(1).max(100).default(100),
  }),
  run: async (payload) => {
    const { imageUrl, x, y, width, height } = payload

    // Artificial 30+ second delay (MANDATORY)
    await wait.for({ seconds: 35 })

    // FFmpeg crop logic here (simplified for demo)
    const croppedUrl = `${process.env.NEXT_PUBLIC_NOSTALGIA_CDN_URL || 'https://example.com'}/cropped/${Date.now()}.jpg`
    
    return {
      croppedImageUrl: croppedUrl,
      inputImageUrl: imageUrl,
      cropParams: { x, y, width, height }
    }
  },
})