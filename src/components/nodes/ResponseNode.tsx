'use client'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Terminal, ChevronDown, Edit3, Trash2, Repeat2, Pencil, Trash } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const ResponseNode = ({ id, selected, data }: NodeProps) => {
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  
  // Find nodes connected to this response node
  const incomingEdges = edges.filter(e => e.target === id)
  const connectedNodes = incomingEdges.map(e => nodes.find(n => n.id === e.source)).filter(Boolean)

  return (
    <div className={cn(
      "w-[380px] bg-white rounded-[24px] overflow-hidden transition-all duration-300",
      selected && "ring-2 ring-[#5e5ce6] shadow-2xl"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f3f5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#eef2ff] rounded-xl flex items-center justify-center">
            <Repeat2 className="w-5 h-5 text-[#5e5ce6]" />
          </div>
          <span className="text-lg font-bold text-[#1a1c21]">Response</span>
          <Info className="w-4 h-4 text-zinc-300" />
        </div>
      </div>

      {/* Results List */}
      <div className="p-6 space-y-6 relative">
        <div className="flex items-center gap-2">
           <span className="text-base font-medium text-zinc-500">result</span>
           <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-[#5e5ce6] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-8" />
        </div>
        
        {connectedNodes.length === 0 ? (
          <div className="py-12 text-center bg-[#f8f9fa] rounded-2xl border-2 border-dashed border-[#f1f3f5]">
             <p className="text-sm text-zinc-400 font-medium italic">No input connected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {connectedNodes.map((node: any) => (
              <div key={node.id} className="bg-[#f8f9fa] rounded-2xl p-5 border border-[#f1f3f5] space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-base font-bold text-[#1a1c21] truncate">{node.id.replace(/-\d+$/, '').replace(/-/g, '_')}</span>
                   <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-zinc-200 rounded transition-colors">
                        <Pencil className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button className="p-1 hover:bg-red-100 rounded transition-colors group">
                        <Trash className="w-4 h-4 text-zinc-400 group-hover:text-red-500" />
                      </button>
                   </div>
                </div>
                <div className="bg-white rounded-xl py-4 px-4 flex items-center justify-center border border-white">
                   {node.data?.output?.response ? (
                      <p className="text-sm text-zinc-700 w-full">{node.data.output.response}</p>
                   ) : (
                      <p className="text-sm text-zinc-300 font-medium italic">No output yet</p>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponseNode