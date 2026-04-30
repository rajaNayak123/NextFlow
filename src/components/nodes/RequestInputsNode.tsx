'use client'
import { Handle, Position, NodeProps } from 'reactflow'
import { Plus, Info, Copy, Trash2, Maximize2, Type } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const RequestInputsNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const fields = data.fields || []

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      name: 'New prompt',
      value: '',
      type: 'text'
    }
    updateNode(id, { fields: [...fields, newField] })
  }

  return (
    <div className={cn(
      "w-[320px] bg-white rounded-[32px] overflow-hidden transition-all duration-300",
      selected && "ring-2 ring-purple-500 shadow-2xl"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-800">Request-Inputs</span>
          <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
        </div>
        <button 
          onClick={addField}
          className="w-8 h-8 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {fields.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
            <p className="text-xs text-zinc-400 font-medium">No inputs defined yet</p>
          </div>
        ) : (
          fields.map((field: any) => (
            <div key={field.id} className="space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center bg-zinc-100 rounded-lg">
                    <Type className="w-3 h-3 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider truncate max-w-[120px]">
                    {field.name}
                  </span>
                  <Info className="w-3 h-3 text-zinc-300" />
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-zinc-50 rounded-md text-zinc-400"><Copy className="w-3.5 h-3.5" /></button>
                  <button className="p-1 hover:bg-red-50 rounded-md text-zinc-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  className="w-full bg-[#F5F6F8] border-none rounded-2xl px-4 py-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none min-h-[100px]"
                  placeholder="Enter text..."
                  value={field.value}
                  onChange={(e) => {
                    const newFields = fields.map((f: any) => 
                      f.id === field.id ? { ...f, value: e.target.value } : f
                    )
                    updateNode(id, { fields: newFields })
                  }}
                />
                <Maximize2 className="absolute bottom-4 right-4 w-3.5 h-3.5 text-zinc-300" />
              </div>

              {/* Source Handles for each field */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${field.id}-output`}
                className="!w-3 !h-3 !bg-white !border-2 !border-orange-400"
                style={{ top: 'auto', bottom: 'auto' }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RequestInputsNode