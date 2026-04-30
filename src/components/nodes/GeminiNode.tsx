'use client'
import { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Play, ChevronDown, Plus, Minus, Maximize2, Settings2, Sparkles } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const GeminiNode = ({ id, selected, data }: NodeProps) => {
  const [activeTab, setActiveTab] = useState('text-to-image')
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const execute = useWorkflowStore((state) => state.execute)

  const [prompt, setPrompt] = useState(data.prompt || '')
  const [imageSize, setImageSize] = useState(data.imageSize || '4:3')
  const [numImages, setNumImages] = useState(data.numImages || 1)

  useEffect(() => {
    updateNode(id, { prompt, imageSize, numImages })
  }, [prompt, imageSize, numImages])

  const isRunning = status === 'running' || nodeStatus === 'running'

  return (
    <div className={cn(
      "w-[380px] bg-white rounded-[40px] overflow-hidden transition-all duration-500",
      selected && "ring-2 ring-purple-500 shadow-2xl",
      isRunning && "running-node"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-zinc-900">Gemini 3.1 Pro</span>
          <Info className="w-4 h-4 text-zinc-300" />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => execute('single', id)}
            className="flex items-center gap-2 bg-[#22C55E] text-white px-5 py-2 rounded-full text-[13px] font-bold hover:brightness-110 transition-all shadow-lg shadow-green-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 rounded-full transition-colors">
            <Settings2 className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 pt-6">
        <div className="flex p-1 bg-[#F5F6F8] rounded-[24px]">
          <button 
            onClick={() => setActiveTab('text-to-image')}
            className={cn(
              "flex-1 py-2.5 rounded-[20px] text-xs font-bold transition-all",
              activeTab === 'text-to-image' ? "bg-[#1A1C21] text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Text to Image
          </button>
          <button 
            onClick={() => setActiveTab('image-to-image')}
            className={cn(
              "flex-1 py-2.5 rounded-[20px] text-xs font-bold transition-all",
              activeTab === 'image-to-image' ? "bg-[#1A1C21] text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Image to Image
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-8 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Prompt</span>
            <span className="text-red-500">*</span>
          </div>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full bg-[#F5F6F8] border-none rounded-[28px] px-6 py-6 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500/10 min-h-[140px] resize-none"
            />
            <Maximize2 className="absolute bottom-6 right-6 w-4 h-4 text-zinc-300" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Number of Images</span>
            <Info className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div className="flex items-center gap-3 bg-[#F5F6F8] rounded-2xl p-1.5 border border-zinc-100">
            <button onClick={() => setNumImages(Math.max(1, numImages - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl text-zinc-400 hover:text-zinc-900 transition-all"><Minus className="w-3.5 h-3.5" /></button>
            <span className="text-sm font-bold min-w-[20px] text-center">{numImages}</span>
            <button onClick={() => setNumImages(numImages + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl text-zinc-400 hover:text-zinc-900 transition-all"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Image Size</span>
            <Info className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <button className="flex items-center justify-between gap-4 bg-[#F5F6F8] rounded-2xl px-5 py-3 border border-zinc-100 min-w-[140px] group">
            <span className="text-sm font-bold text-zinc-900">{imageSize}</span>
            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex items-center gap-2 cursor-pointer group">
          <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
          <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-600 uppercase tracking-widest">Settings</span>
        </div>

        {/* Output Section */}
        <div className="pt-6 border-t border-zinc-50 space-y-4">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Generated Images</span>
          <div className="bg-[#F5F6F8] rounded-[32px] aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-100">
             {data.output?.response ? (
                <div className="w-full h-full p-2">
                   <p className="text-sm text-zinc-700 p-4">{data.output.response}</p>
                </div>
             ) : (
                <>
                  <p className="text-xs text-zinc-400 font-medium italic">No output yet</p>
                </>
             )}
          </div>
        </div>
      </div>

      <div className="px-8 py-4 bg-zinc-50/50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Gemini-Vision Ready</span>
         </div>
         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">$ ~0.03M</span>
      </div>

      {/* Input Handles */}
      <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-around py-12 pointer-events-none">
        <div className="relative flex items-center group/handle">
          <Handle type="target" position={Position.Left} id="prompt" className="!w-3 !h-3 !bg-white !border-2 !border-blue-400 !static !translate-y-0" />
          <span className="absolute left-4 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-0 group-hover/handle:opacity-100 transition-opacity">Prompt</span>
        </div>
        <div className="relative flex items-center group/handle">
          <Handle type="target" position={Position.Left} id="systemPrompt" className="!w-3 !h-3 !bg-white !border-2 !border-purple-400 !static !translate-y-0" />
          <span className="absolute left-4 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-0 group-hover/handle:opacity-100 transition-opacity">System</span>
        </div>
        <div className="relative flex items-center group/handle">
          <Handle type="target" position={Position.Left} id="image" className="!w-3 !h-3 !bg-white !border-2 !border-orange-400 !static !translate-y-0" />
          <span className="absolute left-4 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-0 group-hover/handle:opacity-100 transition-opacity">Image</span>
        </div>
        <div className="relative flex items-center group/handle">
          <Handle type="target" position={Position.Left} id="video" className="!w-3 !h-3 !bg-white !border-2 !border-red-400 !static !translate-y-0" />
          <span className="absolute left-4 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-0 group-hover/handle:opacity-100 transition-opacity">Video</span>
        </div>
        <div className="relative flex items-center group/handle">
          <Handle type="target" position={Position.Left} id="audio" className="!w-3 !h-3 !bg-white !border-2 !border-emerald-400 !static !translate-y-0" />
          <span className="absolute left-4 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-0 group-hover/handle:opacity-100 transition-opacity">Audio</span>
        </div>
        <div className="relative flex items-center group/handle">
          <Handle type="target" position={Position.Left} id="file" className="!w-3 !h-3 !bg-white !border-2 !border-zinc-400 !static !translate-y-0" />
          <span className="absolute left-4 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter opacity-0 group-hover/handle:opacity-100 transition-opacity">File</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle type="source" position={Position.Right} id="response" className="!w-4 !h-4 !bg-white !border-4 !border-blue-500" />
    </div>
  )
}

export default GeminiNode