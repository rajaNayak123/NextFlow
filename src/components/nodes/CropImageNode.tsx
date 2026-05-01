'use client'
import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Image as ImageIcon, GripVertical, Crop, Info, RotateCcw, Play, MoreVertical, Settings2, ChevronRight, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const CropImageNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const execute = useWorkflowStore((state) => state.execute)
  const edges = useWorkflowStore((state) => state.edges)
  const [showSettings, setShowSettings] = useState(false)

  const isHandleConnected = (handleId: string) => edges.some(e => e.target === id && e.targetHandle === handleId)

  const handleChange = (field: string, value: string) => {
    updateNode(id, { [field]: value })
  }

  const isRunning = status === 'running' || nodeStatus === 'running'

  return (
    <div className={cn(
      "node-card transition-all",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
           <h3 className="font-bold text-slate-800 text-sm">Crop Image</h3>
           <Info className="text-slate-400 w-3.5 h-3.5 cursor-help" />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => execute('single', id)}
            disabled={isRunning}
            className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" /> Run
          </button>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Input Row for Image */}
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-orange-400" />
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Image*</label>
          </div>
          <div className={cn(
            "w-full h-12 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest transition-all",
            isHandleConnected('image') && "border-orange-400/30 text-orange-500 bg-orange-50/30"
          )}>
            {isHandleConnected('image') ? "Connected" : "Drop or Connect"}
          </div>
          <Handle
            type="target"
            position={Position.Left}
            id="image"
            className="!w-3 !h-3 !bg-orange-400 !border-none !-left-5.5"
            style={{ top: 38 }}
          />
        </div>

        {/* Dimension Rows */}
        <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-50">
           <div className={cn("space-y-1 relative transition-all", isHandleConnected('x') && "opacity-50")}>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                 <label className="text-[9px] font-black text-slate-400 uppercase">X Position (%)</label>
              </div>
              <input 
                type="number" 
                disabled={isHandleConnected('x')}
                defaultValue={data.x ?? 0}
                onChange={(e) => handleChange('x', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500/50" 
              />
              <Handle type="target" position={Position.Left} id="x" className="!w-2.5 !h-2.5 !bg-pink-400 !border-none !-left-5.5" />
           </div>
           <div className={cn("space-y-1 relative transition-all", isHandleConnected('y') && "opacity-50")}>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                 <label className="text-[9px] font-black text-slate-400 uppercase">Y Position (%)</label>
              </div>
              <input 
                type="number" 
                disabled={isHandleConnected('y')}
                defaultValue={data.y ?? 0}
                onChange={(e) => handleChange('y', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500/50" 
              />
              <Handle type="target" position={Position.Left} id="y" className="!w-2.5 !h-2.5 !bg-pink-400 !border-none !-left-5.5" />
           </div>
        </div>

        {/* Settings / Size */}
        <div className="space-y-2">
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
           >
             <ChevronRight className={cn("w-3 h-3 transition-transform", showSettings && "rotate-90")} />
             Advanced Settings
           </button>
           {showSettings && (
             <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase">Width (%)</label>
                   <input type="number" defaultValue={data.w ?? 100} onChange={(e) => handleChange('w', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-700" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase">Height (%)</label>
                   <input type="number" defaultValue={data.h ?? 100} onChange={(e) => handleChange('h', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-700" />
                </div>
             </div>
           )}
        </div>

        {/* Inline Preview */}
        <div className="pt-2">
           <div className="w-full bg-slate-50 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center overflow-hidden min-h-[120px]">
              {data.outputUrl || data.output ? (
                 <img src={data.outputUrl || data.output} alt="Cropped" className="w-full h-full object-cover" />
              ) : isRunning ? (
                 <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing...</span>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-2 py-8">
                    <ImageIcon className="w-4 h-4 text-slate-200" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No preview</span>
                 </div>
              )}
           </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-3 !h-3 !bg-blue-400 !border-none !-right-5.5"
        />
      </div>
    </div>
  )
}

export default memo(CropImageNode)
