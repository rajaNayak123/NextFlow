'use client'
import { Handle, Position, NodeProps } from 'reactflow'
import { Plus, Info, Copy, Trash2, Maximize2, GripVertical, Type, Image as ImageIcon, Loader2, MoreVertical, RotateCcw } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const RequestInputsNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const fields = data.fields || []

  const addField = (type: 'text_field' | 'image_field' = 'text_field') => {
    const newField = {
      id: `field-${Date.now()}`,
      name: type === 'text_field' ? 'Car prompt' : 'Input image',
      value: '',
      type: type
    }
    updateNode(id, { fields: [...fields, newField] })
  }

  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const isRunning = status === 'running' || nodeStatus === 'running'

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-xl shadow-lg min-w-[320px] overflow-hidden transition-all",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
           <Type className="w-4 h-4 text-gray-400" />
           <span className="text-xs font-bold text-gray-700">Request-Inputs</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => addField('text_field')}
            className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            title="Add Input"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Info className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><MoreVertical className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {fields.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-xl">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No inputs defined</p>
          </div>
        ) : (
          fields.map((field: any) => (
            <div key={field.id} className="space-y-2 relative group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{field.name}</label>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Copy className="w-3 h-3" /></button>
                   <button className="p-1 hover:bg-red-50 rounded text-red-400" onClick={() => {
                     const newFields = fields.filter((f: any) => f.id !== field.id)
                     updateNode(id, { fields: newFields })
                   }}>
                     <Trash2 className="w-3 h-3" />
                   </button>
                </div>
              </div>
              
              <div className="relative">
                {field.type === 'text_field' ? (
                  <textarea
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs text-gray-800 placeholder:text-gray-300 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-none font-medium outline-none"
                    placeholder="Enter text..."
                    value={field.value}
                    onChange={(e) => {
                      const newFields = fields.map((f: any) => 
                        f.id === field.id ? { ...f, value: e.target.value } : f
                      )
                      updateNode(id, { fields: newFields })
                    }}
                  />
                ) : (
                  <div className="w-full bg-gray-50 border-2 border-dashed border-gray-100 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-100/50 transition-all cursor-pointer">
                     <ImageIcon className="w-5 h-5 text-gray-200" />
                     <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center">Drop image here</span>
                  </div>
                )}
                
                {/* Field-aligned Handle */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${field.id}-output`}
                  className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !-right-5.5"
                  style={{ top: '50%' }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RequestInputsNode