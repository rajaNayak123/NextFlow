import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workflow = await prisma.workflow.findFirst({
    where: { 
      id: id,
      userId 
    },
  })

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  return NextResponse.json(workflow)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, nodes, edges } = await req.json()

  const workflow = await prisma.workflow.update({
    where: { id: id },
    data: {
      name,
      nodes,
      edges,
    },
  })

  return NextResponse.json(workflow)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.workflow.delete({
    where: { 
      id: id,
      userId 
    },
  })

  return NextResponse.json({ success: true })
}