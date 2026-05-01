'use client'
import { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Play, ChevronDown, Plus, RotateCcw, MoreHorizontal, Maximize2, Settings2, Sparkles, ChevronRight, Upload, Link2, Mic2, Loader2, MoreVertical, X } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const GeminiNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const execute = useWorkflowStore((state) => state.execute)
  const edges = useWorkflowStore((state) => state.edges)

  const isHandleConnected = (handleId: string) => edges.some(e => e.target === id && e.targetHandle === handleId)

  const [prompt, setPrompt] = useState(data.prompt || '')
  const [imageSize, setImageSize] = useState(data.imageSize || '4:3')
  const [numImages, setNumImages] = useState(data.numImages || 1)
  const [aspectRatio, setAspectRatio] = useState(data.aspectRatio || '16:9')
  const [duration, setDuration] = useState(data.duration || '8')
  const [resolution, setResolution] = useState(data.resolution || '720p')
  const [audioUrl, setAudioUrl] = useState(data.audioUrl || '')
  const [showSettings, setShowSettings] = useState(false)
  const [activeMode, setActiveMode] = useState('text-to-image')

  useEffect(() => {
    updateNode(id, { prompt, imageSize, numImages, aspectRatio, duration, resolution, audioUrl })
  }, [prompt, imageSize, numImages, aspectRatio, duration, resolution, audioUrl])

  const isRunning = status === 'running' || nodeStatus === 'running'
  const isVideo = id.toLowerCase().includes('sora')
  const title = data.title || (isVideo ? 'Sora 2' : 'Gemini 3.1 Pro')

  return (
    <div className={cn(
      "node-card transition-all",
      selected && "ring-2 ring-blue-500 shadow-2xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
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

      {/* Mode Switcher */}
      <div className="px-4 pt-4">
        <div className="flex p-1 bg-slate-100 rounded-lg">
           <button 
             onClick={() => setActiveMode('text-to-image')}
             className={cn("flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all", activeMode === 'text-to-image' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400")}
           >
             Text to Image
           </button>
           <button 
             onClick={() => setActiveMode('image-to-image')}
             className={cn("flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all", activeMode === 'image-to-image' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400")}
           >
             Image to Image
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Input Row - Prompt */}
        <div className="relative space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prompt*</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isHandleConnected('prompt')}
            placeholder="Describe what you want the AI to do..."
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[90px] resize-none font-medium leading-relaxed transition-all",
              isHandleConnected('prompt') && "bg-slate-100 opacity-50 cursor-not-allowed"
            )}
          />
          <Handle 
            type="target" 
            position={Position.Left} 
            id="prompt"
            className="!w-3 !h-3 !bg-orange-400 !border-none !-left-5.5" 
          />
        </div>

        {/* Multimodal Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vision*</label>
            <div className={cn(
              "w-full h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center group cursor-pointer transition-all",
              isHandleConnected('startFrame') ? "bg-blue-50 border-blue-200" : "hover:border-slate-300"
            )}>
               <Upload className={cn("w-3.5 h-3.5 text-slate-300", isHandleConnected('startFrame') ? "text-blue-500" : "group-hover:text-slate-500")} />
            </div>
            <Handle type="target" position={Position.Left} id="startFrame" className="!w-3 !h-3 !bg-blue-400 !border-none !-left-5.5" />
          </div>
          <div className="relative space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audio*</label>
            <div className={cn(
              "w-full h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center group cursor-pointer transition-all",
              isHandleConnected('audio') ? "bg-purple-50 border-purple-200" : "hover:border-slate-300"
            )}>
               <Mic2 className={cn("w-3.5 h-3.5 text-slate-300", isHandleConnected('audio') ? "text-purple-500" : "group-hover:text-slate-500")} />
            </div>
            <Handle type="target" position={Position.Left} id="audio" className="!w-3 !h-3 !bg-purple-400 !border-none !-left-5.5" />
          </div>
        </div>

        {/* Dynamic Parameters */}
        <div className="space-y-3">
           <div className="relative flex items-center justify-between py-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution</label>
              <div className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[10px] font-bold text-slate-700">{resolution}</div>
              <Handle type="target" position={Position.Left} id="resolution" className="!w-3 !h-3 !bg-pink-400 !border-none !-left-5.5" />
           </div>
           <div className="relative flex items-center justify-between py-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aspect Ratio</label>
              <div className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[10px] font-bold text-slate-700">{aspectRatio}</div>
              <Handle type="target" position={Position.Left} id="aspectRatio" className="!w-3 !h-3 !bg-yellow-400 !border-none !-left-5.5" />
           </div>
        </div>

        {/* Settings Accordion */}
        <div className="pt-2">
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
           >
             <ChevronRight className={cn("w-3 h-3 transition-transform", showSettings && "rotate-90")} />
             Settings
           </button>
           {showSettings && (
             <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-slate-400 font-bold uppercase">Duration</span>
                   <span className="text-slate-700 font-bold">{duration}s</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-slate-400 font-bold uppercase">Batch Size</span>
                   <span className="text-slate-700 font-bold">{numImages}</span>
                </div>
             </div>
           )}
        </div>

        {/* Output Preview */}
        <div className="pt-2">
           <div className="w-full bg-slate-50 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center min-h-[120px] overflow-hidden">
              {data.output?.response ? (
                 <div className="p-4 text-center">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">{data.output.response}</p>
                 </div>
              ) : isRunning ? (
                 <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing...</span>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-2 py-8">
                    <Sparkles className="w-4 h-4 text-slate-200" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No output yet</span>
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
        className="!w-3 !h-3 !bg-blue-500 !border-none !-right-1.5" 
      />
    </div>
  )
}

export default GeminiNode