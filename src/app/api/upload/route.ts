import { NextRequest, NextResponse } from "next/server"
import { transloadit } from "@/lib/transloadit"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path = `/tmp/${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
    await writeFile(path, buffer)

    // Using transloadit Node SDK
    transloadit.addFile("my_file", path)
    const assembly = await transloadit.createAssembly({
      params: {
        steps: {
          imported: {
            use: ":original",
            robot: "/image/resize",
            width: 800,
            height: 800,
            resize_strategy: "fit"
          }
        }
      }
    })

    // Return the resulting URL from transloadit
    const resultUrl = assembly.results.imported[0].ssl_url

    return NextResponse.json({ url: resultUrl })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
