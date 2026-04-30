import { tasks } from "@/lib/trigger"

// Workflow execution engine with Concurrent Fan-out
export async function executeWorkflow(
  nodes: any[],
  edges: any[],
  type: string,
  selectedNodes: string[]
) {
  const results: Record<string, any> = {}
  const nodePromises = new Map<string, Promise<any>>()

  // Initialize all nodes
  for (const node of nodes) {
    nodePromises.set(node.id, (async () => {
      // 1. Wait for all dependencies
      const incomingEdges = edges.filter(e => e.target === node.id)
      const parentPromises = incomingEdges.map(e => nodePromises.get(e.source))
      
      // Wait for all parent nodes to complete
      await Promise.all(parentPromises)

      // 2. Resolve inputs from dependencies
      const inputs = resolveInputs(node.id, nodes, edges, results)

      // 3. Skip if partial run and not selected
      if (type !== 'full' && selectedNodes.length > 0 && !selectedNodes.includes(node.id)) {
        results[node.id] = { status: 'skipped', output: node.data }
        return results[node.id]
      }

      // 4. Handle built-in nodes
      if (node.type === 'request-inputs' || node.type === 'response') {
        const startTime = Date.now()
        results[node.id] = { 
          status: 'completed', 
          output: node.data,
          duration: 0,
          startTime,
          endTime: startTime
        }
        return results[node.id]
      }

      // 5. Execute actual node
      const startTime = Date.now()
      const result = await executeNode(node, inputs)
      const endTime = Date.now()
      
      results[node.id] = {
        ...result,
        startTime,
        endTime,
        duration: endTime - startTime,
        inputs // Store inputs for history
      }
      return results[node.id]
    })())
  }

  // Wait for all node promises to settle
  await Promise.allSettled(Array.from(nodePromises.values()))

  return results
}

function resolveInputs(nodeId: string, nodes: any[], edges: any[], results: Record<string, any>) {
  const incoming = edges.filter(e => e.target === nodeId)
  return incoming.reduce((acc, edge) => {
    const sourceResult = results[edge.source]
    if (sourceResult) {
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
