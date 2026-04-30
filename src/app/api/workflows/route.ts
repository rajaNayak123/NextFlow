import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workflows = await prisma.workflow.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(workflows)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let name = "Untitled Workflow"
  try {
    const body = await req.json()
    name = body.name || name
  } catch (e) {
    // Fallback to default name if body is empty or invalid
  }
  
  const workflow = await prisma.workflow.create({
    data: {
      userId,
      name: name || "Untitled Workflow",
      nodes: [
        {
          id: "request-inputs",
          type: "request-inputs",
          data: { fields: [] },
          position: { x: 50, y: 50 },
          deletable: false,
        },
        {
          id: "response",
          type: "response",
          data: {},
          position: { x: 600, y: 200 },
          deletable: false,
        },
      ],
      edges: [],
    },
  })

  return NextResponse.json(workflow)
}