import { Transloadit } from "transloadit"

export const transloadit = new Transloadit({
  authKey: process.env.TRANSLOADIT_AUTH_KEY!,
  authSecret: process.env.TRANSLOADIT_AUTH_SECRET!,
})

export async function uploadImage(file: File): Promise<string> {
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