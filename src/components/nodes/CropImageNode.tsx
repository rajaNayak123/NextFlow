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
      "bg-white border border-gray-200 rounded-xl shadow-lg min-w-[320px] overflow-hidden transition-all",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center gap-2">
           <Crop className="w-4 h-4 text-gray-400" />
           <span className="text-xs font-bold text-gray-700">Crop Image</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Info className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><RotateCcw className="w-3.5 h-3.5" /></button>
          <button 
            onClick={() => execute('single', id)}
            disabled={isRunning}
            className="p-1 hover:bg-emerald-50 rounded text-emerald-500 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><MoreVertical className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Input Row for Image */}
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-orange-500" />
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Image</label>
          </div>
          <div className={cn(
            "w-full h-12 bg-gray-50 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest transition-all",
            isHandleConnected('image') && "border-orange-500/30 text-orange-400 bg-orange-50/30"
          )}>
            {isHandleConnected('image') ? "Connected" : "Connect image"}
          </div>
          <Handle
            type="target"
            position={Position.Left}
            id="image"
            className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white !-left-5.5"
            style={{ top: 38 }}
          />
        </div>

        {/* Dimension Rows */}
        <div className="grid grid-cols-2 gap-3 pb-2 border-b border-gray-50">
           <div className={cn("space-y-1 relative transition-all", isHandleConnected('x') && "opacity-50")}>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                 <label className="text-[9px] font-black text-gray-400 uppercase">X (%)</label>
              </div>
              <input 
                type="number" 
                disabled={isHandleConnected('x')}
                defaultValue={data.x ?? 0}
                onChange={(e) => handleChange('x', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded px-2 py-1 text-[10px] font-bold text-gray-700 outline-none focus:ring-1 focus:ring-blue-500" 
              />
              <Handle type="target" position={Position.Left} id="x" className="!w-2.5 !h-2.5 !bg-pink-500 !border-2 !border-white !-left-5.5" />
           </div>
           <div className={cn("space-y-1 relative transition-all", isHandleConnected('y') && "opacity-50")}>
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                 <label className="text-[9px] font-black text-gray-400 uppercase">Y (%)</label>
              </div>
              <input 
                type="number" 
                disabled={isHandleConnected('y')}
                defaultValue={data.y ?? 0}
                onChange={(e) => handleChange('y', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded px-2 py-1 text-[10px] font-bold text-gray-700 outline-none focus:ring-1 focus:ring-blue-500" 
              />
              <Handle type="target" position={Position.Left} id="y" className="!w-2.5 !h-2.5 !bg-pink-500 !border-2 !border-white !-left-5.5" />
           </div>
        </div>

        {/* Settings / Size */}
        <div className="space-y-2">
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
           >
             <ChevronRight className={cn("w-3 h-3 transition-transform", showSettings && "rotate-90")} />
             More Settings
           </button>
           {showSettings && (
             <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-gray-400 uppercase">Width (%)</label>
                   <input type="number" defaultValue={data.w ?? 100} onChange={(e) => handleChange('w', e.target.value)} className="w-full bg-white border border-gray-100 rounded px-2 py-1 text-[10px] font-bold" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-gray-400 uppercase">Height (%)</label>
                   <input type="number" defaultValue={data.h ?? 100} onChange={(e) => handleChange('h', e.target.value)} className="w-full bg-white border border-gray-100 rounded px-2 py-1 text-[10px] font-bold" />
                </div>
             </div>
           )}
        </div>

        {/* Inline Preview */}
        <div className="pt-2">
           <div className="w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden min-h-[120px]">
              {data.outputUrl || data.output ? (
                 <img src={data.outputUrl || data.output} alt="Cropped" className="w-full h-full object-cover" />
              ) : isRunning ? (
                 <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Processing...</span>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-200" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No preview</span>
                 </div>
              )}
           </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !-right-5.5"
        />
      </div>
    </div>
  )
}

export default memo(CropImageNode)
