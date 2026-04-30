import Transloadit from "transloadit"

export const transloadit = new Transloadit({
  authKey: process.env.TRANSLOADIT_AUTH_KEY!,
  authSecret: process.env.TRANSLOADIT_AUTH_SECRET!,
})

export async function uploadImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const assembly = await transloadit.createAssembly({
    uploads: { "my_file": buffer },
    params: {
      auth: { key: process.env.TRANSLOADIT_AUTH_KEY! },
      steps: {
        imported: {
          use: ":original",
          robot: "/http/import",
        },
        exported: {
          use: "imported",
          robot: "/s3/store",
          credentials: "YOUR_S3_CREDENTIALS",
        },
      },
    },
    waitForCompletion: true,
  })

  return assembly.results.exported[0].ssl_url
}