'use client'
import { useState, useRef, useEffect } from 'react'
import { 
  MoreHorizontal, 
  ExternalLink, 
  Pencil, 
  Copy, 
  FileJson, 
  Trash2, 
  Clock 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface WorkflowCardProps {
  workflow: any
  onDelete: (id: string) => void
  onRename: (workflow: any) => void
}

export default function WorkflowCard({ workflow, onDelete, onRename }: WorkflowCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="group bg-white rounded-[32px] overflow-hidden border border-[#f1f3f5] hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative">
      {/* Thumbnail Area */}
      <div 
        onClick={() => router.push(`/canvas/${workflow.id}`)}
        className="aspect-[16/10] bg-[#f8f9fa] relative cursor-pointer overflow-hidden"
      >
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=60" 
          alt={workflow.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#1a1c21] truncate mb-1">
              {workflow.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Clock className="w-3 h-3" />
              Edited {formatDistanceToNow(new Date(workflow.updatedAt))} ago
            </div>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#f8f9fa] rounded-xl transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-zinc-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-[#f1f3f5] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button 
                  onClick={() => {
                    router.push(`/canvas/${workflow.id}`)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#1a1c21] hover:bg-[#f8f9fa] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                  Open
                </button>
                <button 
                  onClick={() => {
                    onRename(workflow)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#1a1c21] hover:bg-[#f8f9fa] transition-colors"
                >
                  <Pencil className="w-4 h-4 text-zinc-400" />
                  Rename
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#1a1c21] hover:bg-[#f8f9fa] transition-colors">
                  <Copy className="w-4 h-4 text-zinc-400" />
                  Duplicate
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#1a1c21] hover:bg-[#f8f9fa] transition-colors">
                  <FileJson className="w-4 h-4 text-zinc-400" />
                  Export JSON
                </button>
                <div className="h-[1px] bg-[#f1f3f5] my-1 mx-2" />
                <button 
                  onClick={() => {
                    onDelete(workflow.id)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
