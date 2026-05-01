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
  
  const incomingEdges = edges.filter(e => e.target === id)
  const connectedNodes = incomingEdges.map(e => ({
    node: nodes.find(n => n.id === e.source),
    edge: e
  })).filter(item => item.node)

  return (
    <div className={cn(
      "node-card transition-all",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
          <Repeat2 className="w-5 h-5 transform rotate-180" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Response</h3>
      </div>

      {/* Results List */}
      <div className="p-4 space-y-3 relative">
        <Handle 
          type="target" 
          position={Position.Left} 
          id="collection"
          className="!bg-[#A855F7]"
          style={{ left: '-7px' }}
        />
        
        {connectedNodes.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Connect outputs to collect results</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedNodes.map((item: any) => (
              <div key={item.node.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 group">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[140px]">
                     {item.node.id.replace(/-\d+$/, '').replace(/-/g, '_')}
                   </span>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-white rounded shadow-sm text-slate-400 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button className="p-1 hover:bg-red-50 rounded shadow-sm text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                   </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-50 min-h-[40px] flex items-center justify-center shadow-sm">
                   {item.node.data?.output?.response ? (
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2 w-full">{item.node.data.output.response}</p>
                   ) : (
                      <p className="text-[10px] text-slate-300 font-bold italic uppercase tracking-widest">No output yet</p>
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