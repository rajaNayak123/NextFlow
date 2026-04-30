export interface WorkflowNode {
    id: string
    type: 'request-inputs' | 'crop-image' | 'gemini-3.1-pro' | 'response'
    data: any
    position: { x: number; y: number }
    deletable?: boolean
  }
  
  export interface WorkflowEdge {
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
  }