'use server'

import { Transloadit } from "transloadit"

const transloadit = new Transloadit({
  authKey: process.env.TRANSLOADIT_AUTH_KEY!,
  authSecret: process.env.TRANSLOADIT_AUTH_SECRET!,
})

export async function uploadImageAction(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  if (!file) throw new Error("No file provided")

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const assembly = await transloadit.createAssembly({
    uploads: { "file": buffer },
    params: {
      steps: {
        "filtered": {
          robot: "/file/filter",
          use: ":original",
          accepts: [["jpg", "jpeg", "png", "webp", "gif"]],
        }
      }
    },
    waitForCompletion: true,
  })

  if (!assembly?.results?.filtered?.[0]) {
    throw new Error("Transloadit assembly failed")
  }

  return (assembly.results as any).filtered[0].ssl_url
}
