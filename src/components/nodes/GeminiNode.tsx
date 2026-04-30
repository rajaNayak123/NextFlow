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

  const InputRow = ({ label, color, id: handleId, children }: any) => (
    <div className="flex items-center gap-2 px-4 py-2 relative group">
      <span className={cn("w-2 h-2 rounded-full", color)} />
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight flex-1">{label}</label>
      <div className="flex-none flex items-center gap-2">
        {children}
        <button className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded text-gray-400">
           <Plus className="w-3 h-3" />
        </button>
      </div>
      <Handle 
        type="target" 
        position={Position.Left} 
        id={handleId}
        className={cn("!w-3 !h-3 !border-2 !border-white !-left-1.5 transition-transform hover:scale-125", color.replace('bg-', '!bg-'))} 
      />
    </div>
  )

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-xl shadow-lg min-w-[320px] overflow-hidden transition-all",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-gray-400" />
           <span className="text-xs font-bold text-gray-700">{title}</span>
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

      {/* Mode Switcher */}
      <div className="p-4 pt-4">
        <div className="flex p-1 bg-gray-100 rounded-full">
           <button 
             onClick={() => setActiveMode('text-to-image')}
             className={cn("flex-1 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", activeMode === 'text-to-image' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400")}
           >
             Text to Image
           </button>
           <button 
             onClick={() => setActiveMode('image-to-image')}
             className={cn("flex-1 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", activeMode === 'image-to-image' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400")}
           >
             Image to Image
           </button>
        </div>
      </div>

      {/* Input Rows */}
      <div className="pb-4 space-y-1">
        <div className="px-4 pb-2 space-y-2 relative">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-orange-500" />
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Prompt</label>
           </div>
           <textarea 
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             disabled={isHandleConnected('prompt')}
             placeholder="Enter prompt..."
             className={cn(
               "w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-300 focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none font-medium outline-none",
               isHandleConnected('prompt') && "bg-gray-100 opacity-50 cursor-not-allowed"
             )}
           />
           <Handle 
             type="target" 
             position={Position.Left} 
             id="prompt"
             className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white !-left-1.5" 
           />
        </div>

        <InputRow label="Resolution" color="bg-pink-500" id="resolution">
           <div className="text-[10px] font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">{resolution}</div>
        </InputRow>

        <InputRow label="Aspect Ratio" color="bg-yellow-500" id="aspectRatio">
           <div className="text-[10px] font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">{aspectRatio}</div>
        </InputRow>

        {/* Collapsible Settings */}
        <div className="px-4 pt-2">
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
           >
             <ChevronRight className={cn("w-3 h-3 transition-transform", showSettings && "rotate-90")} />
             Settings
           </button>
           {showSettings && (
             <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-gray-400 font-bold uppercase">Duration</span>
                   <span className="text-gray-700 font-bold">{duration}s</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-gray-400 font-bold uppercase">Size</span>
                   <span className="text-gray-700 font-bold">{imageSize}</span>
                </div>
             </div>
           )}
        </div>

        {/* Inline Preview */}
        <div className="px-4 pt-4 pb-2">
           <div className="w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center py-10 gap-2">
              {data.output?.response ? (
                 <div className="px-4 text-center">
                    <p className="text-xs text-gray-600 font-medium line-clamp-3">{data.output.response}</p>
                 </div>
              ) : isRunning ? (
                 <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generating...</span>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-200" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No output yet</span>
                 </div>
              )}
           </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="response" 
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !-right-1.5" 
      />
    </div>
  )
}

export default GeminiNode