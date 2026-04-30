'use client'
import { Handle, Position, NodeProps } from 'reactflow'
import { Plus, Info, Copy, Trash2, Maximize2, Type, Image as ImageIcon, Loader2 } from 'lucide-react'
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
            <div key={field.id} className="space-y-3 group relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center bg-zinc-100 rounded-lg">
                    {field.type === 'image' ? <ImageIcon className="w-3 h-3 text-zinc-500" /> : <Type className="w-3 h-3 text-zinc-500" />}
                  </div>
                  <input
                    type="text"
                    className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider truncate max-w-[90px] bg-transparent border-none focus:ring-0 p-0"
                    value={field.name}
                    onChange={(e) => {
                      const newFields = fields.map((f: any) => 
                        f.id === field.id ? { ...f, name: e.target.value } : f
                      )
                      updateNode(id, { fields: newFields })
                    }}
                  />
                  <select 
                    value={field.type} 
                    onChange={(e) => {
                      const newFields = fields.map((f: any) => 
                        f.id === field.id ? { ...f, type: e.target.value } : f
                      )
                      updateNode(id, { fields: newFields })
                    }}
                    className="text-xs bg-zinc-100 text-zinc-500 rounded px-1 py-0.5 border-none cursor-pointer outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-red-50 rounded-md text-zinc-400 hover:text-red-500" onClick={() => {
                    const newFields = fields.filter((f: any) => f.id !== field.id)
                    updateNode(id, { fields: newFields })
                  }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="relative">
                {field.type === 'image' ? (
                  <div className="w-full bg-[#F5F6F8] border-2 border-dashed border-zinc-200 rounded-2xl px-4 py-4 text-center overflow-hidden relative">
                    {field.previewUrl || field.value ? (
                      <>
                        <img src={field.previewUrl || field.value} className="max-h-32 mx-auto rounded-lg object-cover" />
                        {field.uploading && (
                          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                          </div>
                        )}
                      </>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*"
                        className="text-xs text-zinc-500 w-full"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          
                          const previewUrl = URL.createObjectURL(file)
                          let currentFields = useWorkflowStore.getState().nodes.find(n => n.id === id)?.data.fields || fields
                          
                          updateNode(id, { 
                            fields: currentFields.map((f: any) => 
                              f.id === field.id ? { ...f, previewUrl, uploading: true } : f
                            ) 
                          })

                          const formData = new FormData()
                          formData.append('file', file)
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData })
                            const data = await res.json()
                            
                            currentFields = useWorkflowStore.getState().nodes.find(n => n.id === id)?.data.fields || fields
                            updateNode(id, { 
                              fields: currentFields.map((f: any) => 
                                f.id === field.id ? { ...f, value: data.url, previewUrl: data.url, uploading: false } : f
                              ) 
                            })
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Source Handles for each field */}
      <div className="absolute -right-2 top-[100px] bottom-6 flex flex-col gap-6 pointer-events-none">
        {fields.map((field: any, index: number) => (
          <div key={`${field.id}-handle-wrap`} className="relative flex items-center justify-end h-[140px]">
             <Handle
                type="source"
                position={Position.Right}
                id={`${field.id}-output`}
                className={cn(
                  "!w-3 !h-3 !border-2 !static !translate-y-0",
                  field.type === 'image' ? "!bg-orange-500 !border-white" : "!bg-white !border-orange-400"
                )}
              />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RequestInputsNode