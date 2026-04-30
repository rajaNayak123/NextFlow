'use client'
import { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Play, ChevronDown, Plus, RotateCcw, MoreHorizontal, Maximize2, Settings2, Sparkles, ChevronRight, Upload, Link2 } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const GeminiNode = ({ id, selected, data }: NodeProps) => {
  const [activeTab, setActiveTab] = useState(data.type === 'video' ? 'image-to-video' : 'text-to-image')
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const execute = useWorkflowStore((state) => state.execute)

  const [prompt, setPrompt] = useState(data.prompt || '')
  const [imageSize, setImageSize] = useState(data.imageSize || '4:3')
  const [numImages, setNumImages] = useState(data.numImages || 1)
  const [aspectRatio, setAspectRatio] = useState(data.aspectRatio || '16:9')
  const [duration, setDuration] = useState(data.duration || '8')
  const [resolution, setResolution] = useState(data.resolution || '720p')

  useEffect(() => {
    updateNode(id, { prompt, imageSize, numImages, aspectRatio, duration, resolution })
  }, [prompt, imageSize, numImages, aspectRatio, duration, resolution])

  const isRunning = status === 'running' || nodeStatus === 'running'
  const isVideo = data.type === 'video' || id.toLowerCase().includes('sora')
  const title = data.title || (isVideo ? 'Sora 2' : 'FLUX 2 Pro')

  return (
    <div className={cn(
      "w-[420px] bg-white rounded-[24px] overflow-hidden transition-all duration-500",
      selected && "ring-2 ring-[#5e5ce6] shadow-2xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f3f5]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[#1a1c21]">{title}</span>
          <div className="flex items-center gap-2 ml-4">
            <Info className="w-4 h-4 text-zinc-300" />
            <RotateCcw className="w-4 h-4 text-zinc-300 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => execute('single', id)}
            className="flex items-center gap-2 bg-[#dcfce7] text-[#16a34a] px-5 py-2 rounded-xl text-[14px] font-bold hover:bg-[#bbf7d0] transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Run
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors">
            <MoreHorizontal className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex p-1 bg-[#f8f9fa] rounded-2xl">
          <button 
            onClick={() => setActiveTab(isVideo ? 'text-to-video' : 'text-to-image')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === (isVideo ? 'text-to-video' : 'text-to-image') ? "bg-[#1a1c21] text-white shadow-lg" : "text-zinc-400"
            )}
          >
            {isVideo ? 'Text to Video' : 'Text to Image'}
          </button>
          <button 
            onClick={() => setActiveTab(isVideo ? 'image-to-video' : 'image-to-image')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === (isVideo ? 'image-to-video' : 'image-to-image') ? "bg-[#1a1c21] text-white shadow-lg" : "text-zinc-400"
            )}
          >
             {isVideo ? 'Image to Video' : 'Image to Image'}
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-6 space-y-5">
        {activeTab.includes('image-to') && (
          <div className="space-y-3 relative">
            <div className="flex items-center gap-2">
               <span className="text-sm font-bold text-zinc-500">Start Frame</span>
               <span className="text-red-500">*</span>
            </div>
            <div className="w-full bg-[#f8f9fa] border-none rounded-2xl px-6 py-6 flex items-center justify-center gap-2 text-zinc-400 border-2 border-dashed border-zinc-100">
               <Upload className="w-4 h-4" />
               <span className="text-sm font-medium">Upload image</span>
            </div>
            <Handle type="target" position={Position.Left} id="startFrame" className="!w-4 !h-4 !bg-[#007aff] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-[55px]" />
          </div>
        )}

        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-500">Prompt</span>
              <span className="text-red-500">*</span>
            </div>
            <button className="w-8 h-8 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-lg transition-colors">
              <Plus className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isVideo ? "make car racing" : "Describe the image you want to create..."}
              className="w-full bg-[#f8f9fa] border-none rounded-2xl px-6 py-5 text-base text-[#1a1c21] placeholder:text-zinc-300 focus:ring-2 focus:ring-[#5e5ce6]/10 min-h-[140px] resize-none"
            />
            <Maximize2 className="absolute bottom-5 right-5 w-4 h-4 text-zinc-300" />
          </div>
          <Handle type="target" position={Position.Left} id="prompt" className="!w-4 !h-4 !bg-[#ff9500] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-[60px]" />
        </div>

        {isVideo ? (
          <>
            <div className="flex items-center justify-between relative">
              <span className="text-sm font-bold text-zinc-500">Aspect Ratio</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-between gap-4 bg-[#f8f9fa] rounded-xl px-4 py-2.5 border border-transparent min-w-[140px]">
                  <span className="text-sm font-bold text-[#1a1c21]">{aspectRatio}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors">
                  <Plus className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <Handle type="target" position={Position.Left} id="aspectRatio" className="!w-4 !h-4 !bg-[#ff9500] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-1/2 !-translate-y-1/2" />
            </div>

            <div className="flex items-center justify-between relative">
              <span className="text-sm font-bold text-zinc-500">Duration</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-between gap-4 bg-[#f8f9fa] rounded-xl px-4 py-2.5 border border-transparent min-w-[140px]">
                  <span className="text-sm font-bold text-[#1a1c21]">{duration}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors">
                  <Plus className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <Handle type="target" position={Position.Left} id="duration" className="!w-4 !h-4 !bg-[#ff2d55] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-1/2 !-translate-y-1/2" />
            </div>

            <div className="flex items-center justify-between relative">
              <span className="text-sm font-bold text-zinc-500">Resolution</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-between gap-4 bg-[#f8f9fa] rounded-xl px-4 py-2.5 border border-transparent min-w-[140px]">
                  <span className="text-sm font-bold text-[#1a1c21]">{resolution}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors">
                  <Plus className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <Handle type="target" position={Position.Left} id="resolution" className="!w-4 !h-4 !bg-[#ff9500] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-1/2 !-translate-y-1/2" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-500">Number of Images</span>
                <Info className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-between gap-4 bg-[#f8f9fa] rounded-xl px-4 py-2.5 border border-transparent min-w-[140px]">
                  <span className="text-sm font-bold text-[#1a1c21]">{numImages}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors">
                  <Plus className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <Handle type="target" position={Position.Left} id="numImages" className="!w-4 !h-4 !bg-[#ff2d55] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-1/2 !-translate-y-1/2" />
            </div>

            <div className="flex items-center justify-between relative">
              <span className="text-sm font-bold text-zinc-500">Image Size</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-between gap-4 bg-[#f8f9fa] rounded-xl px-4 py-2.5 border border-transparent min-w-[140px]">
                  <span className="text-sm font-bold text-[#1a1c21]">{imageSize}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors">
                  <Plus className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <Handle type="target" position={Position.Left} id="imageSize" className="!w-4 !h-4 !bg-[#ff9500] !border-white !border-[3px] !shadow-sm !absolute !-left-[34px] !top-1/2 !-translate-y-1/2" />
            </div>
          </>
        )}

        <div className="flex items-center gap-2 cursor-pointer group pt-2">
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-transform" />
          <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-600">Settings</span>
        </div>

        {/* Output Section */}
        <div className="pt-6 border-t border-[#f1f3f5] space-y-4">
          <span className="text-sm font-bold text-zinc-400">{isVideo ? 'Generated Video' : 'Generated Images'}</span>
          <div className="bg-[#f8f9fa] rounded-[24px] aspect-video flex flex-col items-center justify-center gap-3 border-2 border-[#f1f3f5]">
             {data.output?.response ? (
                <div className="w-full h-full p-2">
                   <p className="text-sm text-zinc-700 p-4">{data.output.response}</p>
                </div>
             ) : (
                <p className="text-sm text-zinc-400 font-medium italic">No output yet</p>
             )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-[#f8f9fa] flex items-center justify-between border-t border-[#f1f3f5]">
         <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-400">~0.03M</span>
         </div>
         <Info className="w-4 h-4 text-zinc-300" />
      </div>

      {/* Output Handle */}
      <Handle type="source" position={Position.Right} id="response" className="!w-4 !h-4 !bg-[#007aff] !border-white !border-[3px] !shadow-sm !absolute !-right-[12px] !top-1/2 !-translate-y-1/2" />
    </div>
  )
}

export default GeminiNode