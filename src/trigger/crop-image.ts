import { schemaTask, wait } from "@trigger.dev/sdk/v3"
import { z } from "zod"
import sharp from "sharp"

export const cropImage = schemaTask({
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

    // 1. Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. Get metadata to convert percentages to pixels
    const metadata = await sharp(buffer).metadata()
    if (!metadata.width || !metadata.height) throw new Error("Could not determine image dimensions")

    const pixelX = Math.round((x / 100) * metadata.width)
    const pixelY = Math.round((y / 100) * metadata.height)
    const pixelWidth = Math.min(Math.round((width / 100) * metadata.width), metadata.width - pixelX)
    const pixelHeight = Math.min(Math.round((height / 100) * metadata.height), metadata.height - pixelY)

    // 3. Perform actual crop with sharp
    const croppedBuffer = await sharp(buffer)
      .extract({ left: pixelX, top: pixelY, width: pixelWidth, height: pixelHeight })
      .toBuffer()

    // Artificial 30-second delay (MANDATORY)
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // 4. Return data URL (Real processed image)
    const base64 = croppedBuffer.toString('base64')
    const croppedUrl = `data:image/jpeg;base64,${base64}`
    
    return {
      output: croppedUrl,
      inputImageUrl: imageUrl,
      cropParams: { x, y, width, height, pixelX, pixelY, pixelWidth, pixelHeight }
    }
  },
})