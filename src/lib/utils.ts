import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { tasks } from "@trigger.dev/sdk"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Topological sort for DAG execution
export function topologicalSort(nodes: any[], edges: any[]) {
    const graph: Record<string, string[]> = {}
    const inDegree: Record<string, number> = {}
    
    nodes.forEach(node => {
      graph[node.id] = []
      inDegree[node.id] = 0
    })
  
    edges.forEach(edge => {
      if (graph[edge.source] && graph[edge.target]) {
        graph[edge.source].push(edge.target)
        inDegree[edge.target]++
      }
    })
  
    const queue = Object.keys(inDegree).filter(node => inDegree[node] === 0)
    const result: string[] = []
  
    while (queue.length) {
      const node = queue.shift()!
      result.push(node)
      
      graph[node].forEach(neighbor => {
        inDegree[neighbor]--
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor)
        }
      })
    }
  
    return result.length === nodes.length ? result : null // Detect cycles
  }
  
  // Workflow execution engine
  export async function executeWorkflow(
    nodes: any[],
    edges: any[],
    type: string,
    selectedNodes: string[]
  ) {
    const execOrder = topologicalSort(nodes, edges)
    if (!execOrder) throw new Error("Cycle detected")
  
    const results: Record<string, any> = {}
    
    // We execute nodes in order of topological sort
    // For a real parallel engine, we would group by depth, but this works for a clone
    for (const nodeId of execOrder) {
      const node = nodes.find(n => n.id === nodeId)
      if (!node) continue
      
      // If partial run, only run selected nodes
      if (type !== 'full' && selectedNodes.length > 0 && !selectedNodes.includes(nodeId)) {
        continue
      }

      if (node.type === 'request-inputs' || node.type === 'response') {
        results[nodeId] = { status: 'completed', output: node.data }
        continue
      }
  
      const inputs = resolveInputs(nodeId, nodes, edges, results)
      results[nodeId] = await executeNode(node, inputs)
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
            const fieldId = edge.sourceHandle.split('-')[0]
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
            return { status: 'completed', output: result.output }
    
          case 'gemini-3.1-pro':
            result = await tasks.triggerAndWait("gemini-3.1-pro", {
              prompt: inputs.prompt || node.data.prompt,
              systemPrompt: inputs.systemPrompt || node.data.systemPrompt,
              images: inputs.images || [],
              model: node.data.model || "gemini-3.1-pro",
            })
            return { status: 'completed', output: result.output }
    
          default:
            return { status: 'skipped', error: 'Unknown node type' }
        }
    } catch (error: any) {
        return { status: 'failed', error: error.message }
    }
  }