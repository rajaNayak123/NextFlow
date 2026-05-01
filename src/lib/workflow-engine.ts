import { cropImage } from "@/trigger/crop-image"
import { gemini } from "@/trigger/gemini"
import { flux } from "@/trigger/flux"
import { sora } from "@/trigger/sora"

// Workflow execution engine with Correct DAG Fan-out
export async function executeWorkflow(
  nodes: any[],
  edges: any[],
  type: string,
  selectedNodes: string[]
) {
  const results: Record<string, any> = {}
  const nodePromises = new Map<string, Promise<any>>()

  async function getExecutionPromise(nodeId: string): Promise<any> {
    if (nodePromises.has(nodeId)) return nodePromises.get(nodeId)

    const executionPromise = (async () => {
      const node = nodes.find(n => n.id === nodeId)
      if (!node) return { status: 'failed', error: 'Node not found' }

      // 1. Wait for all dependencies
      const incomingEdges = edges.filter(e => e.target === nodeId)
      const parentPromises = incomingEdges.map(e => getExecutionPromise(e.source))
      await Promise.all(parentPromises)

      // 2. Resolve inputs from dependencies
      const inputs = resolveInputs(nodeId, nodes, edges, results)

      // 3. Skip logic: for partial/single runs, if not targeted, use current data
      const isTargeted = type === 'full' || selectedNodes.includes(nodeId)
      if (!isTargeted) {
        results[nodeId] = { status: 'completed', output: node.data }
        return results[nodeId]
      }

      // 4. Handle built-in nodes
      if (node.type === 'request-inputs' || node.type === 'response') {
        const startTime = Date.now()
        results[nodeId] = { 
          status: 'completed', 
          output: inputs.result || node.data,
          duration: 0,
          startTime,
          endTime: startTime
        }
        return results[nodeId]
      }

      // 5. Execute actual node
      const startTime = Date.now()
      const result = await executeNode(node, inputs)
      const endTime = Date.now()
      
      results[nodeId] = {
        ...result,
        startTime,
        endTime,
        duration: endTime - startTime, // In milliseconds
        inputs
      }
      return results[nodeId]
    })()

    nodePromises.set(nodeId, executionPromise)
    return executionPromise
  }

  // Trigger execution for all nodes (top-level nodes will trigger their children)
  await Promise.all(nodes.map(node => getExecutionPromise(node.id)))

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
          result = await cropImage.triggerAndWait({
            imageUrl: inputs.image || node.data.image,
            x: Number(inputs.x || node.data.x || 0),
            y: Number(inputs.y || node.data.y || 0),
            width: Number(inputs.width || node.data.w || 100),
            height: Number(inputs.height || node.data.h || 100),
          })
          if (!result.ok) throw new Error(result.error ? String(result.error) : "Task failed")
          return { status: 'completed', output: result.output }
  
        case 'gemini-3.1-pro':
          const images = inputs.vision ? [{ base64: inputs.vision, mimeType: "image/png" }] : []
          result = await gemini.triggerAndWait({
            prompt: inputs.prompt || node.data.prompt,
            systemPrompt: inputs.systemPrompt || node.data.systemPrompt,
            images: images,
            model: node.data.model || "gemini-1.5-pro",
          })
          if (!result.ok) throw new Error(result.error ? String(result.error) : "Task failed")
          return { status: 'completed', output: result.output } // Output already contains { response }
  
        case 'flux-2-pro':
          result = await flux.triggerAndWait({
            prompt: inputs.prompt || node.data.prompt,
            aspectRatio: node.data.aspectRatio,
          })
          if (!result.ok) throw new Error(result.error ? String(result.error) : "Task failed")
          return { status: 'completed', output: result.output }

        case 'sora-2':
          result = await sora.triggerAndWait({
            prompt: inputs.prompt || node.data.prompt,
            resolution: node.data.resolution,
          })
          if (!result.ok) throw new Error(result.error ? String(result.error) : "Task failed")
          return { status: 'completed', output: result.output }
  
        default:
          return { status: 'skipped', error: 'Unknown node type' }
      }
  } catch (error: any) {
      return { status: 'failed', error: error.message }
  }
}
