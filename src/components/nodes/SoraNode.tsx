'use client'
import { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Play, Film, Settings2, Sparkles, ChevronRight, Loader2, MoreVertical, X, Monitor, Video } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const SoraNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const execute = useWorkflowStore((state) => state.execute)
  const edges = useWorkflowStore((state) => state.edges)

  const isHandleConnected = (handleId: string) => edges.some(e => e.target === id && e.targetHandle === handleId)

  const [prompt, setPrompt] = useState(data.prompt || '')
  const [aspectRatio, setAspectRatio] = useState(data.aspectRatio || '16:9')
  const [duration, setDuration] = useState(data.duration || '5s')
  const [resolution, setResolution] = useState(data.resolution || '1080p')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    updateNode(id, { prompt, aspectRatio, duration, resolution })
  }, [prompt, aspectRatio, duration, resolution])

  const isRunning = status === 'running' || nodeStatus === 'running'

  return (
    <div className={cn(
      "node-card transition-all",
      selected && "ring-2 ring-purple-500 shadow-2xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Video className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Sora 2 (Video)</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => execute('single', id)}
            disabled={isRunning}
            className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" /> Run
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Prompt */}
        <div className="relative space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Video Prompt*</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isHandleConnected('prompt')}
            placeholder="Describe the video scene..."
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-h-[100px] resize-none font-medium leading-relaxed transition-all",
              isHandleConnected('prompt') && "bg-slate-100 opacity-50"
            )}
          />
          <Handle type="target" position={Position.Left} id="prompt" className="!w-3 !h-3 !bg-orange-400 !border-none !-left-5.5" />
        </div>

        {/* Dynamic Parameters */}
        <div className="grid grid-cols-2 gap-4">
           <div className="relative space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution</label>
              <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 outline-none">
                 <option>1080p</option>
                 <option>720p</option>
                 <option>4K</option>
              </select>
           </div>
           <div className="relative space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aspect Ratio</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 outline-none">
                 <option>16:9</option>
                 <option>9:16</option>
                 <option>1:1</option>
              </select>
           </div>
        </div>

        {/* Output Preview */}
        <div className="pt-2">
           <div className="w-full bg-slate-50 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center min-h-[150px] overflow-hidden">
              {data.output?.videoUrl ? (
                 <video src={data.output.videoUrl} controls className="w-full h-full object-cover" />
              ) : isRunning ? (
                 <div className="flex flex-col items-center gap-2 py-10">
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Video...</span>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-2 py-10">
                    <Monitor className="w-4 h-4 text-slate-200" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No video yet</span>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="response" 
        className="!w-3 !h-3 !bg-purple-500 !border-none !-right-1.5" 
      />
    </div>
  )
}

export default SoraNode
