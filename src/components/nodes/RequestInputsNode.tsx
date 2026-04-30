'use client'
import { Handle, Position, NodeProps } from 'reactflow'
import { Plus, Info, Copy, Trash2, Maximize2, GripVertical, Type, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const RequestInputsNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const fields = data.fields || []

  const addField = (type: 'text' | 'image' = 'text') => {
    const newField = {
      id: `field-${Date.now()}`,
      name: type === 'text' ? 'New prompt' : 'New image',
      value: '',
      type: type
    }
    updateNode(id, { fields: [...fields, newField] })
  }

  const handleFileChange = (fieldId: string, file: File) => {
    // In a real app, this would upload to Transloadit/S3
    // Here we'll create a local preview URL to simulate it
    const previewUrl = URL.createObjectURL(file)
    const newFields = fields.map((f: any) => 
      f.id === fieldId ? { ...f, value: file.name, previewUrl } : f
    )
    updateNode(id, { fields: newFields })
  }

  return (
    <div className={cn(
      "w-[380px] bg-white rounded-[24px] overflow-hidden transition-all duration-300",
      selected && "ring-2 ring-[#5e5ce6] shadow-2xl"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f3f5]">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#1a1c21]">Request-Inputs</span>
          <Info className="w-4 h-4 text-zinc-400 cursor-help" />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => addField('text')}
            title="Add text input"
            className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors"
          >
            <Type className="w-5 h-5 text-zinc-600" />
          </button>
          <button 
            onClick={() => addField('image')}
            title="Add image input"
            className="w-10 h-10 flex items-center justify-center bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {fields.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-[#f1f3f5] rounded-2xl">
            <p className="text-sm text-zinc-400 font-medium">No inputs defined yet</p>
          </div>
        ) : (
          fields.map((field: any, index: number) => (
            <div key={field.id} className="space-y-3 group relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab" />
                  <input
                    type="text"
                    className="text-base font-bold text-[#1a1c21] bg-transparent border-none focus:ring-0 p-0 w-auto min-w-[50px]"
                    value={field.name}
                    onChange={(e) => {
                      const newFields = fields.map((f: any) => 
                        f.id === field.id ? { ...f, name: e.target.value } : f
                      )
                      updateNode(id, { fields: newFields })
                    }}
                  />
                  {field.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> : <Type className="w-3.5 h-3.5 text-zinc-300" />}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors" onClick={() => {
                    const newFields = fields.filter((f: any) => f.id !== field.id)
                    updateNode(id, { fields: newFields })
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative">
                {field.type === 'text' ? (
                  <textarea
                    className="w-full bg-[#f8f9fa] border-none rounded-2xl px-5 py-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-[#5e5ce6]/10 transition-all resize-none min-h-[120px]"
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
                  <div className="space-y-4">
                    <div 
                      className="w-full bg-[#f8f9fa] border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-zinc-50 transition-all cursor-pointer relative"
                      onClick={() => document.getElementById(`file-${field.id}`)?.click()}
                    >
                      {field.previewUrl ? (
                        <img src={field.previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-zinc-400" />
                          </div>
                          <p className="text-sm font-medium text-zinc-400">Click to upload image</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        id={`file-${field.id}`} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileChange(field.id, file)
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Source Handle for this specific field */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${field.id}-output`}
                  className={cn(
                    "!w-4 !h-4 !border-white !border-[3px] !shadow-md !static !absolute !-right-[34px] !top-1/2 !-translate-y-1/2",
                    field.type === 'image' ? "!bg-blue-500" : "!bg-[#ff9500]"
                  )}
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