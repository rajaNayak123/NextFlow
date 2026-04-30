'use client'
import { useState } from 'react'
import { Plus, Search, Image as ImageIcon, Video, Mic2, MoreHorizontal, Sparkles, X } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

interface NodeItem {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: string;
  description: string;
}

const NodePicker = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState('')
  const addNode = useWorkflowStore((state) => state.addNode)

  const nodeCategories: Record<string, NodeItem[]> = {
    Recent: [
      { id: 'gemini-3.1-pro', type: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', icon: '🧠', category: 'Recent', description: 'Advanced multimodal LLM' },
      { id: 'crop-image', type: 'crop-image', name: 'Crop Image', icon: '✂️', category: 'Recent', description: 'Transform and crop images' },
    ],
    Image: [
      { id: 'crop-image', type: 'crop-image', name: 'Crop Image', icon: '✂️', category: 'Image', description: 'Transform and crop images' },
    ],
    Video: [],
    Audio: [],
    Others: [
      { id: 'gemini-3.1-pro', type: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', icon: '🧠', category: 'Others', description: 'Advanced multimodal LLM' },
    ]
  }

  const handleAddNode = (node: NodeItem) => {
    const x = Math.random() * 400 + 300
    const y = Math.random() * 300 + 200
    
    addNode({
      id: `${node.type}-${Date.now()}`,
      type: node.type,
      data: node.type === 'crop-image' ? { x: 0, y: 0, w: 100, h: 100 } : { fields: [] },
      position: { x, y },
    })
    onClose()
  }

  const filteredCategories = Object.entries(nodeCategories).reduce((acc, [category, nodes]) => {
    const filtered = nodes.filter(n => 
      n.name.toLowerCase().includes(search.toLowerCase()) || 
      n.description.toLowerCase().includes(search.toLowerCase())
    )
    if (filtered.length > 0 || (category !== 'Recent' && search === '')) {
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
        "fixed bottom-24 right-8 z-[70] transition-all duration-500",
        isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'
      )}>
        <div className="bg-white border border-zinc-100 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] rounded-[40px] p-2 w-[420px] max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-zinc-900">Add Node</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-xl transition-all">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Search */}
          <div className="px-8 pb-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools, models, nodes..."
                className="w-full pl-14 pr-6 py-4 bg-[#F5F6F8] border-none rounded-[24px] focus:ring-2 focus:ring-purple-500/10 text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar px-8 pb-10">
            {Object.entries(filteredCategories).map(([category, nodes]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    {category}
                  </span>
                  <div className="h-[1px] flex-1 bg-zinc-50" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => handleAddNode(node)}
                      className="group flex items-center gap-5 w-full p-4 hover:bg-[#F5F6F8] rounded-[28px] transition-all duration-300 border border-transparent hover:border-zinc-100"
                    >
                      <div className="w-14 h-14 bg-white shadow-sm border border-zinc-50 rounded-[20px] flex items-center justify-center text-2xl group-hover:scale-110 transition-all group-hover:rotate-3">
                        {node.icon}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-sm text-zinc-900 mb-0.5">{node.name}</div>
                        <div className="text-[11px] text-zinc-400 font-medium line-clamp-1">{node.description}</div>
                      </div>
                      <div className="w-10 h-10 bg-white shadow-sm border border-zinc-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Plus className="w-4 h-4 text-zinc-900" />
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