import { Transloadit } from "@transloadit/sdk"

export const transloadit = new Transloadit({
  authKey: process.env.TRANSLOADIT_AUTH_KEY!,
  authSecret: process.env.TRANSLOADIT_AUTH_SECRET!,
})

export async function uploadImage(file: File): Promise<string> {
  const assembly = await transloadit.createAssembly({
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
    files: { "my_file": file },
  })

  await assembly.await()
  return assembly.results.exported[0].ssl_url
}