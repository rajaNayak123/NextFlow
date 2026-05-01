'use client'
import { useState } from 'react'
import { Plus, Search, Image as ImageIcon, Video, Mic2, MoreHorizontal, Sparkles, X, Brain, Scissors, Film } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'
import type { WorkflowNode } from '@/types/workflow'

interface NodeItem {
  id: string;
  type: WorkflowNode['type'];
  name: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  defaultData?: any;
}

const NodePicker = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState('')
  const addNode = useWorkflowStore((state) => state.addNode)
  const recentNodes = useWorkflowStore((state) => state.recentNodes)

  const nodeCategories: Record<string, NodeItem[]> = {
    'Recent': recentNodes.map(type => {
      const allNodes = [
        { id: 'gemini-3.1-pro', type: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', icon: <Sparkles className="w-6 h-6 text-orange-500" />, category: 'AI Models', description: 'Google Gemini 1.5 Pro' },
        { id: 'flux-2-pro', type: 'flux-2-pro', name: 'FLUX 2 Pro', icon: <Brain className="w-6 h-6 text-blue-500" />, category: 'AI Models', description: 'AI Image Generator', defaultData: { title: 'FLUX 2 Pro', type: 'image' } },
        { id: 'sora-2', type: 'sora-2', name: 'Sora 2', icon: <Film className="w-6 h-6 text-purple-500" />, category: 'AI Models', description: 'AI Video Generator', defaultData: { title: 'Sora 2', type: 'video' } },
        { id: 'crop-image', type: 'crop-image', name: 'Crop Image', icon: <Scissors className="w-6 h-6 text-orange-500" />, category: 'Image', description: 'Transform and crop images' },
      ] as NodeItem[]
      return allNodes.find(n => n.type === type)
    }).filter((n): n is NodeItem => !!n),
    'AI Models': [
      { id: 'gemini-3.1-pro', type: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', icon: <Sparkles className="w-6 h-6 text-orange-500" />, category: 'AI Models', description: 'Google Gemini 1.5 Pro' },
      { id: 'flux-2-pro', type: 'flux-2-pro', name: 'FLUX 2 Pro', icon: <Brain className="w-6 h-6 text-blue-500" />, category: 'AI Models', description: 'AI Image Generator', defaultData: { title: 'FLUX 2 Pro', type: 'image' } },
      { id: 'sora-2', type: 'sora-2', name: 'Sora 2', icon: <Film className="w-6 h-6 text-purple-500" />, category: 'AI Models', description: 'AI Video Generator', defaultData: { title: 'Sora 2', type: 'video' } },
    ],
    'Image': [
      { id: 'crop-image', type: 'crop-image', name: 'Crop Image', icon: <Scissors className="w-6 h-6 text-orange-500" />, category: 'Image', description: 'Transform and crop images' },
    ],
    'Others': []
  }

  const handleAddNode = (node: NodeItem) => {
    const x = Math.random() * 400 + 300
    const y = Math.random() * 300 + 200
    
    addNode({
      id: `${node.type}-${Date.now()}`,
      type: node.type,
      data: node.defaultData || (node.type === 'crop-image' ? { x: 0, y: 0, w: 100, h: 100 } : { fields: [] }),
      position: { x, y },
      deletable: node.type !== 'request-inputs' && node.type !== 'response'
    })
    onClose()
  }

  const filteredCategories = Object.entries(nodeCategories).reduce((acc, [category, nodes]) => {
    const filtered = nodes.filter(n => 
      n.name.toLowerCase().includes(search.toLowerCase()) || 
      n.description.toLowerCase().includes(search.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, NodeItem[]>)

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300" 
          onClick={onClose} 
        />
      )}
      <div className={cn(
        "fixed bottom-32 left-1/2 -translate-x-1/2 z-[70] transition-all duration-500",
        isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'
      )}>
        <div className="bg-white border border-[#f1f3f5] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] rounded-[32px] p-2 w-[450px] max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a1c21]">Add Node</h2>
            <button onClick={onClose} className="p-2 hover:bg-[#f8f9fa] rounded-xl transition-all">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-14 pr-6 py-4 bg-[#f8f9fa] border-none rounded-2xl focus:ring-2 focus:ring-[#5e5ce6]/10 text-[#1a1c21] placeholder:text-zinc-300 font-medium transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar px-6 pb-10">
            {Object.entries(filteredCategories).map(([category, nodes]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {category}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#f1f3f5]" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => handleAddNode(node)}
                      className="group flex items-center gap-4 w-full p-4 hover:bg-[#f8f9fa] rounded-2xl transition-all duration-300 border border-transparent hover:border-[#f1f3f5]"
                    >
                      <div className="w-12 h-12 bg-white shadow-sm border border-[#f1f3f5] rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                        {node.icon}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#1a1c21] mb-0.5">{node.name}</div>
                        <div className="text-xs text-zinc-400 font-medium line-clamp-1">{node.description}</div>
                      </div>
                      <div className="w-8 h-8 bg-white shadow-sm border border-[#f1f3f5] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Plus className="w-4 h-4 text-[#1a1c21]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default NodePicker