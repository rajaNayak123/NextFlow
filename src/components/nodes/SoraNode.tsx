'use client'
import { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Play, RotateCcw, MoreHorizontal, ChevronDown, Plus, Loader2, Video } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const SoraNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const execute = useWorkflowStore((state) => state.execute)

  const [activeTab, setActiveTab] = useState('Text to Video')
  const isRunning = status === 'running' || nodeStatus === 'running'

  return (
    <div className={cn(
      "node-card transition-all",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Sora 2</h3>
          <div className="flex items-center gap-1.5 ml-1">
             <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
             <RotateCcw className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => execute('single', id)}
            className="bg-[#22C55E] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-green-600 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" /> Run
          </button>
          <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="px-4 pt-4">
        <div className="flex p-1 bg-slate-100 rounded-xl">
           {['Text to Video', 'Image to Video'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "flex-1 py-2 rounded-lg text-[11px] font-bold transition-all",
                 activeTab === tab 
                   ? "bg-[#111827] text-white shadow-sm" 
                   : "text-slate-500 hover:text-slate-700"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Input Rows */}
        <div className="space-y-4">
          {/* Prompt */}
          <div className="relative space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <label className="text-xs font-semibold text-slate-600">Prompt</label>
            </div>
            <textarea 
              placeholder="Cinematic drone shot of a snowy mountain..."
              className="w-full bg-[#F8F9FA] border border-slate-100 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[80px] resize-none"
            />
            <Handle type="target" position={Position.Left} id="prompt" className="!bg-[#F59E0B]" />
          </div>

          {/* Duration */}
          <div className="relative space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#EC4899]" />
              <label className="text-xs font-semibold text-slate-600">Duration</label>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#F8F9FA] border border-slate-100 rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-700">10 Seconds</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <button className="w-10 h-10 flex items-center justify-center bg-[#F8F9FA] border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Handle type="target" position={Position.Left} id="duration" className="!bg-[#EC4899]" />
          </div>
        </div>

        {/* Output Box */}
        <div className="pt-2">
          <div className="w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center min-h-[160px] relative group overflow-hidden">
             {isRunning ? (
               <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generating...</span>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Video className="w-5 h-5 text-slate-300" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated Video</span>
               </div>
             )}
             <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-slate-500">~1.20M</span>
             </div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" className="!bg-[#22C55E]" />
    </div>
  )
}

export default SoraNode
