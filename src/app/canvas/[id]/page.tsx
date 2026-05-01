'use client'
import { useCallback, useRef, useState, useEffect } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  ReactFlowProvider,
} from 'reactflow'
import AnimatedEdge from '@/components/canvas/AnimatedEdge'
import { useWorkflowStore } from '@/stores/workflowStore'
import 'reactflow/dist/style.css'
import RequestInputsNode from '@/components/nodes/RequestInputsNode'
import CropImageNode from '@/components/nodes/CropImageNode'
import GeminiNode from '@/components/nodes/GeminiNode'
import FluxNode from '@/components/nodes/FluxNode'
import SoraNode from '@/components/nodes/SoraNode'
import ResponseNode from '@/components/nodes/ResponseNode'
import NodePicker from '@/components/canvas/NodePicker'
import HistoryPanel from '@/components/canvas/HistoryPanel'
import {
  Play,
  Undo,
  Redo,
  Trash2,
  Maximize2,
  ChevronLeft,
  Plus,
  Download,
  Upload,
  Settings2,
  RotateCcw,
  MoreHorizontal
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const nodeTypes: NodeTypes = {
  'request-inputs': RequestInputsNode,
  'crop-image': CropImageNode,
  'gemini-3.1-pro': GeminiNode,
  'flux-2-pro': FluxNode,
  'sora-2': SoraNode,
  'response': ResponseNode,
}

const edgeTypes = {
  animated: AnimatedEdge
}

function CanvasContent() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string
  
  const { 
    nodes, 
    edges, 
    selectedNodes,
    setNodes, 
    setEdges, 
    status,
    execute,
    loadWorkflow,
    saveWorkflow,
    setSelectedNodes,
    undo,
    redo,
    undoStack,
    redoStack,
    saveHistory
  } = useWorkflowStore()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [rfInstance, setRfInstance] = useState<any>(null)

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId)
    }
  }, [workflowId, loadWorkflow])

  // Auto-save logic (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveWorkflow()
    }, 2000)
    return () => clearTimeout(timer)
  }, [nodes, edges, saveWorkflow])

  const onConnect = useCallback(
    (params: Connection) => {
      saveHistory()
      const edgeId = `edge-${Math.random().toString(36).substr(2, 9)}`
      setEdges((eds: any[]) => [...eds, { ...params, id: edgeId, type: 'animated' }])
    },
    [setEdges, saveHistory]
  )

  const isValidConnection = useCallback((connection: Connection) => {
    if (connection.source === connection.target) return false

    // Fix: use latest state for nodes/edges
    const { nodes, edges } = useWorkflowStore.getState()
    const sourceNode = nodes.find((n: any) => n.id === connection.source)
    const targetNode = nodes.find((n: any) => n.id === connection.target)
    if (!sourceNode || !targetNode) return false

    // DAG Cycle detection - use latest edges
    const hasCycle = (source: string, target: string) => {
      const visited = new Set<string>()
      const queue = [target]
      
      while (queue.length > 0) {
        const current = queue.shift()!
        if (current === source) return true
        if (visited.has(current)) continue
        visited.add(current)
        
        const neighbors = edges.filter(e => e.source === current).map(e => e.target)
        queue.push(...neighbors)
      }
      return false
    }

    if (hasCycle(connection.source!, connection.target!)) return false

    // Type-safe connection enforcement
    const sourceHandleId = connection.sourceHandle || ''
    const targetHandleId = connection.targetHandle || ''

    const isImageOutput = 
      sourceNode.type === 'crop-image' || 
      sourceNode.type === 'flux-2-pro' ||
      (sourceNode.type === 'request-inputs' && sourceNode.data.fields?.find((f: any) => `${f.id}-output` === sourceHandleId)?.type === 'image')

    const isVideoOutput = sourceNode.type === 'sora-2'
    const isTextOutput = sourceNode.type === 'gemini-3.1-pro' || (sourceNode.type === 'request-inputs' && sourceNode.data.fields?.find((f: any) => `${f.id}-output` === sourceHandleId)?.type === 'text')

    const isImageInput = 
      (targetNode.type === 'crop-image' && targetHandleId === 'image') ||
      (targetNode.type === 'gemini-3.1-pro' && targetHandleId === 'vision') ||
      (targetNode.type === 'flux-2-pro' && targetHandleId === 'image') ||
      (targetNode.type === 'sora-2' && targetHandleId === 'image')

    const isTextInput = 
      (targetNode.type === 'gemini-3.1-pro' && (targetHandleId === 'prompt' || targetHandleId === 'systemPrompt')) ||
      (targetNode.type === 'flux-2-pro' && targetHandleId === 'prompt') ||
      (targetNode.type === 'sora-2' && targetHandleId === 'prompt')

    // Enforcement logic
    if (isImageOutput && !isImageInput && targetNode.type !== 'response') return false
    if (isTextOutput && !isTextInput && targetNode.type !== 'response') return false
    if (isVideoOutput && targetNode.type !== 'response') return false 
    
    if (isImageInput && !isImageOutput) return false
    if (isTextInput && !isTextOutput) return false

    return true
  }, [])

  const onNodesChange = useCallback(
    (changes: any[]) => {
      const isSignificant = changes.some(c => 
        c.type !== 'position' || (c.type === 'position' && !c.dragging)
      )
      if (isSignificant) {
        saveHistory()
      }
      setNodes((nds: any[]) => {
        const safeChanges = changes.filter(c => {
          if (c.type === 'remove') {
            const node = nds.find(n => n.id === c.id)
            if (node && node.deletable === false) return false
          }
          return true
        })
        return applyNodeChanges(safeChanges, nds) as any[]
      })
    },
    [setNodes, saveHistory]
  )

  const onEdgesChange = useCallback(
    (changes: any[]) => {
      if (changes.some(c => c.type === 'remove' || c.type === 'add')) {
        saveHistory()
      }
      setEdges((eds: any[]) => applyEdgeChanges(changes, eds) as any[])
    },
    [setEdges, saveHistory]
  )

  const onSelectionChange = useCallback(({ nodes: selected }: any) => {
    setSelectedNodes(selected.map((n: any) => n.id))
  }, [setSelectedNodes])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNodes.length === 0) return
      saveHistory()
      setNodes((nds: any[]) => 
        nds.filter(n => 
          !selectedNodes.includes(n.id) || n.deletable === false
        )
      )
    }
  }, [setNodes, selectedNodes, saveHistory])

  const saveAndFit = () => {
    saveWorkflow()
    rfInstance?.fitView()
  }

  return (
    <div className="h-full w-full flex bg-[#F8FAFC] overflow-hidden text-zinc-900">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <div className="h-20 bg-white/80 backdrop-blur-2xl border-b border-zinc-100 flex items-center px-8 gap-6 z-50">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </button>
        <div className="h-8 w-[1px] bg-zinc-100" />
        <div className="flex-1">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Project</div>
          <div className="font-black text-xl text-zinc-900 truncate">
            Workflow Builder
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest",
            status === 'running' ? 'bg-green-100 text-green-600' :
            status === 'completed' ? 'bg-blue-100 text-blue-600' :
            'bg-zinc-100 text-zinc-400'
          )}>
            {status}
          </div>
          <div className="h-8 w-[1px] bg-zinc-100" />
          <button 
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all disabled:opacity-50" 
            onClick={undo}
            disabled={undoStack.length === 0}
          >
            <Undo className="w-5 h-5 text-zinc-400" />
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all disabled:opacity-50" 
            onClick={redo}
            disabled={redoStack.length === 0}
          >
            <Redo className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="h-8 w-[1px] bg-zinc-100" />
          <button 
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all" 
            onClick={() => {
              const { nodes, edges } = useWorkflowStore.getState()
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }, null, 2))
              const a = document.createElement('a')
              a.href = dataStr
              a.download = "workflow-export.json"
              a.click()
            }}
            title="Export Workflow"
          >
            <Download className="w-5 h-5 text-zinc-400" />
          </button>
          <label 
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all cursor-pointer"
            title="Import Workflow"
          >
            <Upload className="w-5 h-5 text-zinc-400" />
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (event) => {
                  try {
                    const parsed = JSON.parse(event.target?.result as string)
                    if (parsed.nodes && parsed.edges) {
                      saveHistory()
                      setNodes(parsed.nodes)
                      setEdges(parsed.edges)
                    }
                  } catch(e) { console.error("Invalid JSON") }
                }
                reader.readAsText(file)
                e.target.value = ''
              }} 
            />
          </label>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all" onClick={saveAndFit} title="Fit View & Save">
            <Maximize2 className="w-5 h-5 text-zinc-400" />
          </button>
          <button 
            className="flex items-center gap-3 bg-[#1A1C21] hover:bg-zinc-800 text-white px-8 py-3 rounded-[20px] font-bold text-sm shadow-xl shadow-zinc-900/10 transition-all duration-300 ml-2"
            onClick={() => execute('full')}
          >
            <Play className="w-4 h-4 fill-current" />
            Run Workflow
          </button>
          {selectedNodes.length > 0 && (
            <button 
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-[20px] font-bold text-sm shadow-xl shadow-blue-500/20 transition-all duration-300 ml-2"
              onClick={() => execute('partial')}
            >
              <Play className="w-4 h-4 fill-current" />
              Run Selected ({selectedNodes.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative outline-none" ref={reactFlowWrapper} tabIndex={0} onKeyDown={onKeyDown}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onInit={setRfInstance}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ 
            type: 'animated',
            style: { strokeWidth: 3 }
          }}
          fitView
          minZoom={0.1}
          maxZoom={2}
          className="bg-[#F9FAFB]"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1.5}
            color="#E5E7EB"
          />
          <MiniMap 
            style={{ bottom: 20, right: 20 }}
            nodeStrokeColor={(n) => {
              if (n.type === 'request-inputs') return '#64748b'
              if (n.type === 'gemini-3.1-pro') return '#fb923c'
              if (n.type === 'crop-image') return '#f472b6'
              return '#cbd5e1'
            }}
            nodeColor="#fff"
            nodeBorderRadius={12}
            maskColor="rgba(0, 0, 0, 0.05)"
          />
        </ReactFlow>
      </div>

      </div>
      
      {/* Floating Toolbar - Bottom Center */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
        <button 
          onClick={() => setPickerOpen(true)}
          className="w-14 h-14 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all active:scale-95 group border border-white/10"
        >
          <Plus className={cn("w-6 h-6 transition-transform", pickerOpen && "rotate-45")} />
        </button>
        
        <div className="bg-slate-900 rounded-2xl px-6 py-3 flex items-center gap-6 shadow-2xl border border-white/10">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Core Active</span>
           </div>
           <div className="h-4 w-px bg-white/10" />
           <div className="flex items-center gap-4">
              <Settings2 className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <RotateCcw className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <MoreHorizontal className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer transition-colors" />
           </div>
        </div>
      </div>

      <NodePicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)} />
      
      <HistoryPanel />
    </div>
  )
}

export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  )
}