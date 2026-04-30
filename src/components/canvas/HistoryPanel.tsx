'use client'
import { useWorkflowStore } from '@/stores/workflowStore'
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const HistoryPanel = () => {
  const history = useWorkflowStore(state => state.history)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!history.length) {
    return (
      <div className="w-80 bg-white/10 backdrop-blur-xl border-l border-white/10 flex flex-col">
        <div className="p-8 text-center text-zinc-400">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <div className="text-lg font-medium">No runs yet</div>
          <div className="text-sm">Execute your workflow to see history</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white/10 backdrop-blur-xl border-l border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h3 className="font-bold text-lg bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
          Execution History
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.slice(0, 10).map((run: any) => (
          <div key={run.id} className="group">
            <button
              onClick={() => setExpanded(expanded === run.id ? null : run.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/10 rounded-2xl transition-all duration-200 border border-white/10 group-hover:border-white/20"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    run.status === 'completed' && 'bg-emerald-500',
                    run.status === 'running' && 'bg-blue-500 animate-pulse',
                    run.status === 'failed' && 'bg-red-500',
                    run.status === 'partial' && 'bg-yellow-500'
                  )} />
                  <span className="font-medium text-white">{run.type} Run</span>
                </div>
                <div className="text-sm text-zinc-400">
                  {new Date(run.createdAt).toLocaleString()}
                </div>
                {run.duration && (
                  <div className="text-xs text-zinc-500">{run.duration.toFixed(1)}s</div>
                )}
              </div>
              <ChevronRight className={`w-5 h-5 text-zinc-400 transition-transform ${expanded === run.id ? 'rotate-90' : ''}`} />
            </button>
            
            {expanded === run.id && (
              <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-zinc-400">Status</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      run.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      run.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      run.status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    )}>
                      {run.status}
                    </span>
                  </div>
                  {run.duration && (
                    <div className="space-y-1">
                      <span className="text-zinc-400">Duration</span>
                      <span className="font-mono">{run.duration.toFixed(1)}s</span>
                    </div>
                  )}
                </div>
                {run.nodes && run.nodes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Details</div>
                    <div className="space-y-1">
                      {run.nodes.map((node: any) => (
                        <div key={node.id} className="flex items-center justify-between text-xs py-1">
                          <span className="text-zinc-400 truncate max-w-[120px]">{node.id}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-md font-bold uppercase text-[9px]",
                            node.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                            node.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                            'bg-zinc-500/10 text-zinc-400'
                          )}>
                            {node.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {run.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-400 inline mr-2" />
                    <span className="text-red-300 text-sm">{run.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryPanel