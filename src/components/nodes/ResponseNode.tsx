'use client'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Terminal, ChevronDown, Edit3, Trash2, Repeat2, Pencil, Trash, ListChecks, MoreVertical } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const ResponseNode = ({ id, selected, data }: NodeProps) => {
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const isRunning = status === 'running' || nodeStatus === 'running'
  
  // Find nodes connected to this response node
  const incomingEdges = edges.filter(e => e.target === id)
  const connectedNodes = incomingEdges.map(e => ({
    node: nodes.find(n => n.id === e.source),
    edge: e
  })).filter(item => item.node)

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-xl shadow-lg min-w-[320px] overflow-hidden transition-all",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
           <ListChecks className="w-4 h-4 text-gray-400" />
           <span className="text-xs font-bold text-gray-700">Response</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Info className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><MoreVertical className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Results List */}
      <div className="p-4 space-y-4 relative">
        <div className="flex items-center gap-2 mb-2">
           <span className="w-2 h-2 rounded-full bg-blue-500" />
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collection List</label>
        </div>
        
        <Handle 
          type="target" 
          position={Position.Left} 
          id="collection"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !-left-5.5 !top-12" 
        />
        
        {connectedNodes.length === 0 ? (
          <div className="py-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Connect outputs to collect results</p>
          </div>
        ) : (
          <div className="space-y-2">
            {connectedNodes.map((item: any) => (
              <div key={item.node.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 group">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-tight truncate max-w-[140px]">
                     {item.node.id.replace(/-\d+$/, '').replace(/-/g, '_')}
                   </span>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-400 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button className="p-1 hover:bg-red-50 rounded text-red-400 transition-colors">
                        <Trash className="w-3 h-3" />
                      </button>
                   </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100/50 min-h-[40px] flex items-center justify-center">
                   {item.node.data?.output?.response ? (
                      <p className="text-[11px] text-gray-600 font-medium leading-relaxed line-clamp-2 w-full">{item.node.data.output.response}</p>
                   ) : (
                      <p className="text-[10px] text-gray-300 font-bold italic uppercase tracking-widest">No output yet</p>
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