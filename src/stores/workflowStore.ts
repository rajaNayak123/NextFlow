import { create } from 'zustand'
import { ReactFlowState, Node, Edge } from 'reactflow'
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow'

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodes: string[]
  history: any[]
  undoStack: { nodes: WorkflowNode[], edges: WorkflowEdge[] }[]
  redoStack: { nodes: WorkflowNode[], edges: WorkflowEdge[] }[]
  workflowId?: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  nodeStatuses: Record<string, 'idle' | 'running' | 'completed' | 'failed'>
  
  setNodes: (nodes: WorkflowNode[] | ((nodes: WorkflowNode[]) => WorkflowNode[])) => void
  setEdges: (edges: WorkflowEdge[] | ((edges: WorkflowEdge[]) => WorkflowEdge[])) => void
  addNode: (node: WorkflowNode) => void
  updateNode: (nodeId: string, data: any) => void
  updateNodeStatus: (nodeId: string, status: 'idle' | 'running' | 'completed' | 'failed') => void
  deleteNode: (nodeId: string) => void
  setSelectedNodes: (nodes: string[]) => void
  execute: (type: 'full' | 'partial' | 'single', nodeId?: string) => Promise<void>
  loadWorkflow: (id: string) => Promise<void>
  saveWorkflow: () => Promise<void>
  setHistory: (history: any[]) => void
  setStatus: (status: WorkflowState['status']) => void
  saveHistory: () => void
  undo: () => void
  redo: () => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // ... existing nodes, edges, etc.
  nodes: [
    {
      id: 'request-inputs',
      type: 'request-inputs',
      data: { fields: [] },
      position: { x: 50, y: 100 },
      deletable: false,
    },
    {
      id: 'response',
      type: 'response',
      data: {},
      position: { x: 800, y: 200 },
      deletable: false,
    },
  ],
  edges: [],
  selectedNodes: [],
  history: [],
  undoStack: [],
  redoStack: [],
  status: 'idle',
  nodeStatuses: {},

  setNodes: (nodes) => set((state) => ({ 
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes 
  })),
  setEdges: (edges) => set((state) => ({ 
    edges: typeof edges === 'function' ? edges(state.edges) : edges 
  })),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
  })),
  updateNodeStatus: (nodeId, status) => set((state) => ({
    nodeStatuses: { ...state.nodeStatuses, [nodeId]: status }
  })),
  deleteNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== nodeId),
    edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
  })),
  setSelectedNodes: (nodes) => set({ selectedNodes: nodes }),
  
  async execute(type, nodeId) {
    const { workflowId, selectedNodes, nodes } = get()
    if (!workflowId) return
    
    // Determine which nodes are part of this execution
    const targets = nodeId ? [nodeId] : (type === 'full' ? nodes.map(n => n.id) : selectedNodes)
    
    set({ status: 'running' })
    targets.forEach(id => {
      set(state => ({ nodeStatuses: { ...state.nodeStatuses, [id]: 'running' } }))
    })
    
    try {
      const res = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, selectedNodes: targets }),
      })
      const data = await res.json()
      
      // Update nodes with results
      if (data.results) {
        Object.entries(data.results).forEach(([id, result]: [string, any]) => {
            get().updateNode(id, { output: result.output })
            set(state => ({ 
              nodeStatuses: { ...state.nodeStatuses, [id]: result.status || 'completed' } 
            }))
        })
      }

      // Reset nodes that weren't executed if they were marked running
      nodes.forEach(n => {
        if (!data.results?.[n.id] && get().nodeStatuses[n.id] === 'running') {
          set(state => ({ nodeStatuses: { ...state.nodeStatuses, [n.id]: 'idle' } }))
        }
      })

      // Fetch updated history
      try {
        const hRes = await fetch(`/api/workflows/${workflowId}/history`)
        const historyData = await hRes.json()
        set({ history: historyData || [] })
      } catch (e) {}

      set({ status: 'completed' })
    } catch (error) {
      set({ status: 'failed' })
      targets.forEach(id => {
        set(state => ({ nodeStatuses: { ...state.nodeStatuses, [id]: 'failed' } }))
      })
    }
  },
  
  async loadWorkflow(id: string) {
    const res = await fetch(`/api/workflows/${id}`)
    const workflow = await res.json()
    
    let historyData = []
    try {
      const hRes = await fetch(`/api/workflows/${id}/history`)
      historyData = await hRes.json()
    } catch (e) {}

    const history: any[] = historyData || []
    const latestExecution = history.find(ex => ex.status === 'completed' || ex.status === 'failed' || ex.status === 'partial')
    
    let nodeStatuses: Record<string, any> = {}
    let updatedNodes = workflow.nodes
    
    if (latestExecution && latestExecution.nodes) {
      const resultsArray = latestExecution.nodes as any[]
      nodeStatuses = resultsArray.reduce((acc, res: any) => {
        acc[res.id] = res.status
        return acc
      }, {} as any)
      
      updatedNodes = workflow.nodes.map((n: any) => {
        const result = resultsArray.find(r => r.id === n.id)
        if (result) {
          return { ...n, data: { ...n.data, output: result.output } }
        }
        return n
      })
    }

    set({ 
      nodes: updatedNodes, 
      edges: workflow.edges,
      workflowId: id,
      history: history,
      nodeStatuses
    })
  },
  
  async saveWorkflow() {
    const { workflowId, nodes, edges } = get()
    if (!workflowId) return
    
    await fetch(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    })
  },
  
  setHistory: (history) => set({ history }),
  setStatus: (status) => set({ status }),
  
  saveHistory: () => set((state) => ({
    undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
    redoStack: []
  })),

  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state
    const prev = state.undoStack[state.undoStack.length - 1]
    return {
      nodes: prev.nodes,
      edges: prev.edges,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, { nodes: state.nodes, edges: state.edges }]
    }
  }),

  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state
    const next = state.redoStack[state.redoStack.length - 1]
    return {
      nodes: next.nodes,
      edges: next.edges,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }]
    }
  })
}))