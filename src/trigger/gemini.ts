import { schemaTask } from "@trigger.dev/sdk/v3"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "dummy")

export const gemini = schemaTask({
  id: "gemini-3.1-pro",
  schema: z.object({
    prompt: z.string().min(1),
    systemPrompt: z.string().optional(),
    images: z.array(z.object({
      base64: z.string().optional(),
      mimeType: z.string().optional(),
    })).optional(),
    model: z.string().optional().default("gemini-1.5-pro"),
  }),
  run: async (payload) => {
    const { prompt, systemPrompt, images, model } = payload
    
    const geminiModel = genAI.getGenerativeModel({ 
      model: model || "gemini-1.5-pro",
    })

    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }

    let result
    if (images && images.length > 0) {
      // Vision request
      const promptParts: any[] = [
        systemPrompt ? `System: ${systemPrompt}\n\nUser: ${prompt}` : prompt,
        ...images.map(img => ({ inlineData: { data: img.base64!, mimeType: img.mimeType! } }))
      ]
      
      result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: promptParts }],
        generationConfig,
      })
    } else {
      // Text only
      const promptText = systemPrompt ? `System: ${systemPrompt}\n\nUser: ${prompt}` : prompt
      result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig,
      })
    }

    const response = await result.response
    const text = response.text()

    return {
      output: text,
      usage: response.usageMetadata,
    }
  },
})