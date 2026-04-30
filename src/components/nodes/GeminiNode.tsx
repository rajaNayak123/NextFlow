'use client'
import { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Play, ChevronDown, Plus, RotateCcw, MoreHorizontal, Maximize2, Settings2, Sparkles, ChevronRight, Upload, Link2, Mic2, Loader2 } from 'lucide-react'
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

  useEffect(() => {
    updateNode(id, { prompt, imageSize, numImages, aspectRatio, duration, resolution, audioUrl })
  }, [prompt, imageSize, numImages, aspectRatio, duration, resolution, audioUrl])

  const isRunning = status === 'running' || nodeStatus === 'running'
  const isVideo = data.type === 'video' || id.toLowerCase().includes('sora')
  const title = data.title || (isVideo ? 'Sora 2' : 'Gemini 3.1 Pro')

  return (
    <div className={cn(
      "w-[450px] bg-white rounded-[32px] overflow-hidden transition-all duration-500",
      selected && "ring-2 ring-[#5e5ce6] shadow-2xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[#f1f3f5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-lg font-black text-[#1a1c21] tracking-tight">{title}</span>
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Multimodal Model</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => execute('single', id)}
            disabled={isRunning}
            className="flex items-center gap-2 bg-[#dcfce7] text-[#16a34a] px-5 py-2.5 rounded-2xl text-[14px] font-black hover:bg-[#bbf7d0] transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            Run
          </button>
        </div>
      </div>

      {/* Multimodal Inputs */}
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Image Input</label>
            <div className={cn(
              "w-full h-12 bg-[#f8f9fa] rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-100 group transition-all cursor-pointer",
              isHandleConnected('startFrame') ? "opacity-50 grayscale cursor-not-allowed border-blue-500" : "hover:border-blue-200"
            )}>
               <Upload className={cn("w-4 h-4 text-zinc-300 transition-colors", !isHandleConnected('startFrame') && "group-hover:text-blue-500")} />
            </div>
            <Handle type="target" position={Position.Left} id="startFrame" className="!w-4 !h-4 !bg-blue-500 !border-white !border-[3px] !shadow-lg !absolute !-left-[42px] !top-10" />
          </div>
          <div className="space-y-2 relative">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Audio Input</label>
            <div className={cn(
              "w-full h-12 bg-[#f8f9fa] rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-100 group transition-all cursor-pointer",
              isHandleConnected('audio') ? "opacity-50 grayscale cursor-not-allowed border-purple-500" : "hover:border-purple-200"
            )}>
               <Mic2 className={cn("w-4 h-4 text-zinc-300 transition-colors", !isHandleConnected('audio') && "group-hover:text-purple-500")} />
            </div>
            <Handle type="target" position={Position.Left} id="audio" className="!w-4 !h-4 !bg-purple-500 !border-white !border-[3px] !shadow-lg !absolute !-left-[42px] !top-10" />
          </div>
        </div>

        <div className="space-y-3 relative">
          <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Prompt</label>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isHandleConnected('prompt')}
              placeholder={isHandleConnected('prompt') ? "Input connected from another node..." : "Describe what you want the AI to do..."}
              className={cn(
                "w-full bg-[#f8f9fa] border-none rounded-[24px] px-6 py-5 text-base text-[#1a1c21] placeholder:text-zinc-300 focus:ring-2 focus:ring-[#5e5ce6]/10 min-h-[160px] resize-none font-medium leading-relaxed transition-all",
                isHandleConnected('prompt') && "opacity-50 cursor-not-allowed bg-zinc-50"
              )}
            />
            <Handle type="target" position={Position.Left} id="prompt" className="!w-4 !h-4 !bg-orange-500 !border-white !border-[3px] !shadow-lg !absolute !-left-[42px] !top-12" />
          </div>
        </div>

        {/* Dynamic Controls */}
        <div className="space-y-4">
           {isVideo ? (
             <div className="grid grid-cols-2 gap-4">
                <div className={cn("space-y-2 relative transition-all", isHandleConnected('resolution') && "opacity-50")}>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Resolution</label>
                  <div className="bg-[#f8f9fa] rounded-xl px-4 py-3 font-bold text-sm text-zinc-700">{resolution}</div>
                  <Handle type="target" position={Position.Left} id="resolution" className="!w-4 !h-4 !bg-pink-500 !border-white !border-[3px] !shadow-md !absolute !-left-[42px] !top-10" />
                </div>
                <div className={cn("space-y-2 relative transition-all", isHandleConnected('duration') && "opacity-50")}>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Duration</label>
                  <div className="bg-[#f8f9fa] rounded-xl px-4 py-3 font-bold text-sm text-zinc-700">{duration}s</div>
                  <Handle type="target" position={Position.Left} id="duration" className="!w-4 !h-4 !bg-red-500 !border-white !border-[3px] !shadow-md !absolute !-left-[42px] !top-10" />
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-4">
                <div className={cn("space-y-2 relative transition-all", isHandleConnected('aspectRatio') && "opacity-50")}>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Aspect Ratio</label>
                  <div className="bg-[#f8f9fa] rounded-xl px-4 py-3 font-bold text-sm text-zinc-700">{aspectRatio}</div>
                  <Handle type="target" position={Position.Left} id="aspectRatio" className="!w-4 !h-4 !bg-yellow-500 !border-white !border-[3px] !shadow-md !absolute !-left-[42px] !top-10" />
                </div>
                <div className={cn("space-y-2 relative transition-all", isHandleConnected('imageSize') && "opacity-50")}>
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Output Size</label>
                  <div className="bg-[#f8f9fa] rounded-xl px-4 py-3 font-bold text-sm text-zinc-700">{imageSize}</div>
                  <Handle type="target" position={Position.Left} id="imageSize" className="!w-4 !h-4 !bg-emerald-500 !border-white !border-[3px] !shadow-md !absolute !-left-[42px] !top-10" />
                </div>
             </div>
           )}
        </div>

        {/* Output Section */}
        <div className="pt-8 border-t border-[#f1f3f5] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">AI Response</label>
            {data.output && <div className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">Result Ready</div>}
          </div>
          <div className="bg-[#f8f9fa] rounded-[28px] border-2 border-[#f1f3f5] overflow-hidden">
             {data.output?.response ? (
                <div className="p-6">
                   <p className="text-sm text-zinc-700 leading-relaxed font-medium">{data.output.response}</p>
                </div>
             ) : isRunning ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                   <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                   <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Generating...</p>
                </div>
             ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                   <Sparkles className="w-5 h-5 text-zinc-200" />
                   <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">No output yet</p>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-5 bg-[#f8f9fa] flex items-center justify-between border-t border-[#f1f3f5]">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Model: 1.5 Flash</span>
            </div>
         </div>
         <Settings2 className="w-4 h-4 text-zinc-300" />
      </div>

      {/* Output Handle */}
      <Handle type="source" position={Position.Right} id="response" className="!w-4 !h-4 !bg-[#5e5ce6] !border-white !border-[3px] !shadow-lg !absolute !-right-[12px] !top-1/2 !-translate-y-1/2" />
    </div>
  )
}

export default GeminiNode