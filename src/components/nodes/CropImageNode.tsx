'use client'
import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Image as ImageIcon, GripVertical, Crop } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const CropImageNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])

  const handleChange = (field: string, value: string) => {
    updateNode(id, { [field]: value })
  }

  return (
    <div className={cn(
      "node-default min-w-[280px]",
      selected && "ring-2 ring-blue-500/50 shadow-blue-glow",
      (status === 'running' || nodeStatus === 'running') && "running-node-pulse"
    )}>
      <div className="node-header">
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-zinc-400" />
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-1 rounded-lg" />
            <span className="font-bold text-lg text-blue-400">Crop Image</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-2">
        <div className="relative">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Input Image</label>
          <Handle
            type="target"
            position={Position.Left}
            id="image"
            className="w-4 h-4 bg-orange-500 border-2 border-white shadow-lg !bg-orange-500 hover:!scale-110"
            style={{ top: 32 }}
          />
          <div className="w-full h-10 px-3 bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl flex items-center text-sm text-zinc-500">
            Connect image input
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">X Position (%)</label>
            <input 
              type="number" 
              defaultValue={data.x ?? 0}
              onChange={(e) => handleChange('x', e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-zinc-300/50 dark:border-zinc-700/50 rounded-xl text-sm focus:ring-blue-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Y Position (%)</label>
            <input 
              type="number" 
              defaultValue={data.y ?? 0}
              onChange={(e) => handleChange('y', e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-zinc-300/50 dark:border-zinc-700/50 rounded-xl text-sm focus:ring-blue-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Width (%)</label>
            <input 
              type="number" 
              defaultValue={data.w ?? 100}
              onChange={(e) => handleChange('w', e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-zinc-300/50 dark:border-zinc-700/50 rounded-xl text-sm focus:ring-blue-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Height (%)</label>
            <input 
              type="number" 
              defaultValue={data.h ?? 100}
              onChange={(e) => handleChange('h', e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-zinc-300/50 dark:border-zinc-700/50 rounded-xl text-sm focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 border-2 border-white shadow-lg !bg-blue-500 hover:!scale-110"
        />
      </div>
      
      {data.outputUrl && (
        <div className="mt-4 p-2 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
          <img src={data.outputUrl} alt="Cropped preview" className="w-full h-auto rounded-lg object-cover" />
        </div>
      )}
    </div>
  )
}

export default memo(CropImageNode)
