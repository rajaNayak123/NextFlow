'use client'
import { useCallback, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import { useWorkflowStore } from '@/stores/workflowStore'
import 'reactflow/dist/style.css'
import RequestInputsNode from '@/components/nodes/RequestInputsNode'
import CropImageNode from '@/components/nodes/CropImageNode'
import GeminiNode from '@/components/nodes/GeminiNode'
import ResponseNode from '@/components/nodes/ResponseNode'
import NodePicker from '@/components/canvas/NodePicker'
import {
  Play,
  Undo,
  Redo,
  Trash2,
  Maximize2,
  ChevronLeft,
  Plus
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

const nodeTypes: NodeTypes = {
  'request-inputs': RequestInputsNode,
  'crop-image': CropImageNode,
  'gemini-3.1-pro': GeminiNode,
  'response': ResponseNode,
}

export default function CanvasPage() {
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
    setSelectedNodes 
  } = useWorkflowStore()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [rfInstance, setRfInstance] = useState<any>(null)

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId)
    }
  }, [workflowId, loadWorkflow])

  const onConnect = useCallback(
    (params: any) => {
      // Type-safe connections only
      const validConnections = [
        'request-inputs', 'crop-image', 'gemini-3.1-pro'
      ].some(sourceType => 
        nodes.find((n: any) => n.id === params.source)?.type === sourceType
      )
      
      if (validConnections) {
        setEdges((eds: any[]) => [...eds, params])
      }
    },
    [setEdges, nodes]
  )

  const onNodesChange = useCallback(
    (changes: any[]) => {
      setNodes((nds: any[]) => {
        // Prevent deleting fixed nodes
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
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: any[]) => {
      setEdges((eds: any[]) => applyEdgeChanges(changes, eds) as any[])
    },
    [setEdges]
  )

  const onSelectionChange = useCallback(({ nodes: selected }: any) => {
    setSelectedNodes(selected.map((n: any) => n.id))
  }, [setSelectedNodes])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Delete') {
      // Delete selected (except fixed nodes)
      setNodes((nds: any[]) => 
        nds.filter(n => 
          !n.deletable === false && selectedNodes.includes(n.id)
        )
      )
    }
  }, [setNodes, selectedNodes])

  const saveAndFit = () => {
    saveWorkflow()
    rfInstance?.fitView()
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F8FAFC] overflow-hidden text-zinc-900">
      {/* Top Bar */}
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
          <button className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all" onClick={saveAndFit}>
            <Maximize2 className="w-5 h-5 text-zinc-400" />
          </button>
          <button 
            className="flex items-center gap-3 bg-[#1A1C21] hover:bg-zinc-800 text-white px-8 py-3 rounded-[20px] font-bold text-sm shadow-xl shadow-zinc-900/10 transition-all duration-300 ml-2"
            onClick={() => execute('full')}
          >
            <Play className="w-4 h-4 fill-current" />
            Run Workflow
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper} tabIndex={-1} onKeyDown={onKeyDown}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 100, y: 100, zoom: 1 }}
          className="bg-galaxy-bg"
        >
          <Background 
            variant="dots" 
            gap={20} 
            size={1}
            className="grid-dot"
          />
          <Controls className="backdrop-blur-xl bg-white/10 border-white/20 rounded-2xl" />
          <MiniMap 
            className="backdrop-blur-xl bg-white/10 border-white/20 rounded-2xl"
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>
      </div>

      {/* Floating Node Picker */}
      <button
        onClick={() => setPickerOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-3xl shadow-2xl border-4 border-white/20 backdrop-blur-xl flex items-center justify-center text-2xl hover:scale-110 transition-all duration-300 hover:shadow-blue-glow z-40"
      >
        <Plus />
      </button>

      {/* Node Picker Modal */}
      <NodePicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  )
}