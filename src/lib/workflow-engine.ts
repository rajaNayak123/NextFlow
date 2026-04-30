import { tasks } from "@/lib/trigger"

function getExecutionLevels(nodes: any[], edges: any[]): string[][] {
  const inDegree: Record<string, number> = {}
  const graph: Record<string, string[]> = {}
  
  nodes.forEach(n => {
    inDegree[n.id] = 0
    graph[n.id] = []
  })
  edges.forEach(e => {
    if (graph[e.source] && inDegree[e.target] !== undefined) {
      graph[e.source].push(e.target)
      inDegree[e.target]++
    }
  })

  let queue = Object.keys(inDegree).filter(n => inDegree[n] === 0)
  const levels: string[][] = []

  while (queue.length > 0) {
    levels.push(queue)
    const nextQueue: string[] = []
    for (const node of queue) {
      for (const neighbor of graph[node]) {
        inDegree[neighbor]--
        if (inDegree[neighbor] === 0) {
          nextQueue.push(neighbor)
        }
      }
    }
    queue = nextQueue
  }
  return levels
}

// Workflow execution engine
export async function executeWorkflow(
  nodes: any[],
  edges: any[],
  type: string,
  selectedNodes: string[]
) {
  const levels = getExecutionLevels(nodes, edges)
  const totalInLevels = levels.reduce((acc, lvl) => acc + lvl.length, 0)
  if (totalInLevels !== nodes.length) throw new Error("Cycle detected")

  const results: Record<string, any> = {}
  
  for (const level of levels) {
    await Promise.all(level.map(async (nodeId) => {
      const node = nodes.find(n => n.id === nodeId)
      if (!node) return
      
      // If partial run, only run selected nodes
      if (type !== 'full' && selectedNodes.length > 0 && !selectedNodes.includes(nodeId)) {
        return
      }

      if (node.type === 'request-inputs' || node.type === 'response') {
        results[nodeId] = { status: 'completed', output: node.data }
        return
      }

      const inputs = resolveInputs(nodeId, nodes, edges, results)
      results[nodeId] = await executeNode(node, inputs)
    }))
  }

  return results
}

function resolveInputs(nodeId: string, nodes: any[], edges: any[], results: Record<string, any>) {
  const incoming = edges.filter(e => e.target === nodeId)
  return incoming.reduce((acc, edge) => {
    const sourceResult = results[edge.source]
    if (sourceResult) {
      // Handle handles - RequestInputs nodes have field-specific handles
      if (edge.sourceHandle) {
          const fieldId = edge.sourceHandle.replace('-output', '')
          const field = sourceResult.output?.fields?.find((f: any) => f.id === fieldId)
          acc[edge.targetHandle || 'input'] = field?.value || field?.previewUrl || sourceResult.output?.[fieldId]
      } else {
          acc[edge.targetHandle || 'input'] = sourceResult.output
      }
    }
    return acc
  }, {} as any)
}

async function executeNode(node: any, inputs: any) {
  try {
      let result
      switch (node.type) {
        case 'crop-image':
          result = await tasks.triggerAndWait("crop-image", {
            imageUrl: inputs.image || node.data.image,
            x: Number(inputs.x || node.data.x || 0),
            y: Number(inputs.y || node.data.y || 0),
            width: Number(inputs.width || node.data.w || 100),
            height: Number(inputs.height || node.data.h || 100),
          })
          if (!result.ok) {
            throw new Error(result.error ? String(result.error) : "Task failed")
          }
          return { status: 'completed', output: result.output }
  
        case 'gemini-3.1-pro':
          const images = inputs.startFrame ? [{ base64: inputs.startFrame, mimeType: "image/png" }] : (inputs.images || [])
          result = await tasks.triggerAndWait("gemini-3.1-pro", {
            prompt: inputs.prompt || node.data.prompt,
            systemPrompt: inputs.systemPrompt || node.data.systemPrompt,
            images: images,
            model: node.data.model || "gemini-1.5-pro",
          })
          if (!result.ok) {
            throw new Error(result.error ? String(result.error) : "Task failed")
          }
          return { status: 'completed', output: { response: result.output?.output || result.output } }
  
        default:
          return { status: 'skipped', error: 'Unknown node type' }
      }
  } catch (error: any) {
      return { status: 'failed', error: error.message }
  }
}
