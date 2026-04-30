import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const history = await prisma.execution.findMany({
    where: { 
      workflowId: params.id,
      userId 
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json(history)
}