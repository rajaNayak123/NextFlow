import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { executeWorkflow } from "@/lib/workflow-engine"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { type = "full", selectedNodes = [] } = await req.json()
  const workflow = await prisma.workflow.findFirst({
    where: { id: id, userId }
  })

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  const nodes = workflow.nodes as any[]
  const edges = workflow.edges as any[]

  // Create execution record
  const execution = await prisma.execution.create({
    data: {
      workflowId: id,
      userId,
      status: "running",
      type,
      nodes: [],
    }
  })

  // Execute nodes (parallel where possible)
  const results = await executeWorkflow(nodes, edges, type, selectedNodes)

  // Update execution with results
  await prisma.execution.update({
    where: { id: execution.id },
    data: {
      status: "completed",
      nodes: results,
      duration: (Date.now() - new Date(execution.createdAt).getTime()) / 1000
    }
  })

  // Update workflow status
  await prisma.workflow.update({
    where: { id: id },
    data: { status: "completed" }
  })

  return NextResponse.json({ executionId: execution.id, results })
}