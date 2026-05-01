'use client'
import { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Info, Play, ChevronDown, Plus, RotateCcw, MoreHorizontal, Maximize2, Settings2, Sparkles, ChevronRight, Upload, Link2, Mic2, Loader2, MoreVertical, X, Film, FileText } from 'lucide-react'
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
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || '')
  const [model, setModel] = useState(data.model || 'gemini-1.5-pro')
  const [showSettings, setShowSettings] = useState(false)
  
  // Specific settings
  const [temperature, setTemperature] = useState(data.temperature || 0.7)
  const [topP, setTopP] = useState(data.topP || 0.95)

  useEffect(() => {
    updateNode(id, { prompt, systemPrompt, model, temperature, topP })
  }, [prompt, systemPrompt, model, temperature, topP])

  const isRunning = status === 'running' || nodeStatus === 'running'

  return (
    <div className={cn(
      "node-card transition-all",
      selected && "ring-2 ring-blue-500 shadow-2xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm">Gemini 3.1 Pro</h3>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-[10px] font-bold text-slate-400 bg-transparent outline-none cursor-pointer hover:text-slate-600 transition-colors"
            >
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
            </select>
          </div>
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
        {/* System Prompt */}
        <div className="relative space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Prompt</label>
          <textarea 
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            disabled={isHandleConnected('systemPrompt')}
            placeholder="Instruct the AI how to behave..."
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[60px] resize-none font-medium transition-all",
              isHandleConnected('systemPrompt') && "bg-slate-100 opacity-50"
            )}
          />
          <Handle type="target" position={Position.Left} id="systemPrompt" className="!w-3 !h-3 !bg-slate-400 !border-none !-left-5.5" />
        </div>

        {/* Prompt */}
        <div className="relative space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prompt*</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isHandleConnected('prompt')}
            placeholder="Describe what you want the AI to do..."
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[90px] resize-none font-medium leading-relaxed transition-all",
              isHandleConnected('prompt') && "bg-slate-100 opacity-50"
            )}
          />
          <Handle type="target" position={Position.Left} id="prompt" className="!w-3 !h-3 !bg-orange-400 !border-none !-left-5.5" />
        </div>

        {/* Multimodal Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Image (Vision)</label>
            <div className={cn("w-full h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center", isHandleConnected('vision') && "bg-blue-50 border-blue-200")}>
               <Upload className={cn("w-3.5 h-3.5", isHandleConnected('vision') ? "text-blue-500" : "text-slate-300")} />
            </div>
            <Handle type="target" position={Position.Left} id="vision" className="!w-3 !h-3 !bg-blue-400 !border-none !-left-5.5" />
          </div>
          <div className="relative space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audio</label>
            <div className={cn("w-full h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center", isHandleConnected('audio') && "bg-purple-50 border-purple-200")}>
               <Mic2 className={cn("w-3.5 h-3.5", isHandleConnected('audio') ? "text-purple-500" : "text-slate-300")} />
            </div>
            <Handle type="target" position={Position.Left} id="audio" className="!w-3 !h-3 !bg-purple-400 !border-none !-left-5.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Video</label>
            <div className={cn("w-full h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center", isHandleConnected('video') && "bg-red-50 border-red-200")}>
               <Film className={cn("w-3.5 h-3.5", isHandleConnected('video') ? "text-red-500" : "text-slate-300")} />
            </div>
            <Handle type="target" position={Position.Left} id="video" className="!w-3 !h-3 !bg-red-400 !border-none !-left-5.5" />
          </div>
          <div className="relative space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">File</label>
            <div className={cn("w-full h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center", isHandleConnected('file') && "bg-zinc-100 border-zinc-200")}>
               <FileText className={cn("w-3.5 h-3.5", isHandleConnected('file') ? "text-zinc-600" : "text-slate-300")} />
            </div>
            <Handle type="target" position={Position.Left} id="file" className="!w-3 !h-3 !bg-zinc-500 !border-none !-left-5.5" />
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
                <div className="flex flex-col gap-1">
                   <span className="text-[9px] text-slate-400 font-bold uppercase">Temperature</span>
                   <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[9px] text-slate-400 font-bold uppercase">Top P</span>
                   <input type="range" min="0" max="1" step="0.1" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
             </div>
           )}
        </div>

        {/* Output Preview */}
        <div className="pt-2">
           <div className="w-full bg-slate-50 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center min-h-[100px] overflow-hidden">
              {data.output?.response ? (
                 <div className="p-4 w-full">
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{data.output.response}</p>
                 </div>
              ) : isRunning ? (
                 <div className="flex flex-col items-center gap-2 py-6">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing...</span>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-2 py-6">
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