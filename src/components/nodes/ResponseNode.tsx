'use client'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Terminal, ChevronDown, Edit3, Trash2 } from 'lucide-react'
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
      "w-[350px] bg-white rounded-[40px] overflow-hidden transition-all duration-300",
      selected && "ring-2 ring-blue-500 shadow-2xl"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <Terminal className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-base font-bold text-zinc-900">Response</span>
          <Info className="w-4 h-4 text-zinc-300" />
        </div>
      </div>

      {/* Results List */}
      <div className="p-8 space-y-6">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Result</span>
        
        {connectedNodes.length === 0 ? (
          <div className="py-12 text-center bg-[#F5F6F8] rounded-[32px] border-2 border-dashed border-zinc-100">
             <p className="text-xs text-zinc-400 font-medium italic">No input connected</p>
          </div>
        ) : (
          connectedNodes.map((node: any) => (
            <div key={node.id} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                 <span className="text-xs font-bold text-zinc-600 truncate">{node.id.replace(/-\d+$/, '').replace(/-/g, '_')}</span>
                 <div className="flex items-center gap-2">
                    <Edit3 className="w-3 h-3 text-zinc-300" />
                    <Trash2 className="w-3 h-3 text-zinc-300" />
                 </div>
              </div>
              <div className="bg-[#F5F6F8] rounded-[24px] p-6 border border-zinc-100">
                 {node.data?.output?.response ? (
                    <p className="text-sm text-zinc-800 line-clamp-4">{node.data.output.response}</p>
                 ) : (
                    <p className="text-xs text-zinc-400 font-medium italic text-center">No output yet</p>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-white !border-4 !border-green-500" />
    </div>
  )
}

export default ResponseNode