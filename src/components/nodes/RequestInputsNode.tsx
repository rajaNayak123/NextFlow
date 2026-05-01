import { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Plus, Info, Copy, Trash2, Maximize2, GripVertical, Type, Image as ImageIcon, Loader2, MoreVertical, RotateCcw, Hash, CheckSquare, Music, Video, FileText, X } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { cn } from '@/lib/utils'

const inputTypes = [
  { id: 'text', name: 'Text', icon: Type, color: 'text-blue-500' },
  { id: 'number', name: 'Number', icon: Hash, color: 'text-orange-500' },
  { id: 'boolean', name: 'Boolean', icon: CheckSquare, color: 'text-green-500' },
  { id: 'image', name: 'Image', icon: ImageIcon, color: 'text-purple-500' },
  { id: 'audio', name: 'Audio', icon: Music, color: 'text-pink-500' },
  { id: 'video', name: 'Video', icon: Video, color: 'text-red-500' },
  { id: 'file', name: 'File', icon: FileText, color: 'text-zinc-500' },
]

const RequestInputsNode = ({ id, selected, data }: NodeProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const fields = data.fields || []
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const addField = (typeId: string) => {
    const type = inputTypes.find(t => t.id === typeId)
    const newField = {
      id: `field-${Date.now()}`,
      name: `${type?.name} prompt`,
      value: '',
      type: typeId
    }
    updateNode(id, { fields: [...fields, newField] })
    setIsDropdownOpen(false)
  }

  const status = useWorkflowStore((state) => state.status)
  const nodeStatus = useWorkflowStore((state) => state.nodeStatuses[id])
  const isRunning = status === 'running' || nodeStatus === 'running'

  return (
    <div className={cn(
      "node-card transition-all relative",
      selected && "ring-2 ring-blue-500 shadow-xl",
      isRunning && "running-node-pulse"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Request-Inputs</h3>
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
          >
            {isDropdownOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-10 p-1 animate-in fade-in zoom-in duration-200">
              {inputTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addField(type.id)}
                  className="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors group"
                >
                  <type.icon className={cn("w-4 h-4", type.color)} />
                  <span className="font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {fields.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-400">No fields added yet. Click the + icon to add input fields.</p>
          </div>
        ) : (
          fields.map((field: any) => {
            const Icon = inputTypes.find(t => t.id === field.type)?.icon || Type
            return (
              <div key={field.id} className="space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                    <label className="text-xs font-semibold text-slate-600">{field.name}</label>
                  </div>
                  <div className="flex items-center gap-1">
                     <button className="p-1.5 hover:bg-slate-50 rounded text-slate-400 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                     <button className="p-1.5 hover:bg-red-50 rounded text-red-400 transition-colors" onClick={() => {
                       const newFields = fields.filter((f: any) => f.id !== field.id)
                       updateNode(id, { fields: newFields })
                     }}>
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
                </div>
                
                <div className="relative">
                  {(field.type === 'text' || field.type === 'number') ? (
                    <textarea
                      className="w-full bg-[#F3F4F6] border border-transparent rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[100px] resize-y font-medium transition-all"
                      placeholder="Enter text..."
                      value={field.value}
                      onChange={(e) => {
                        const newFields = fields.map((f: any) => 
                          f.id === field.id ? { ...f, value: e.target.value } : f
                        )
                        updateNode(id, { fields: newFields })
                      }}
                    />
                  ) : field.type === 'boolean' ? (
                    <div className="w-full bg-[#F3F4F6] rounded-xl p-4 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                       <span className="text-sm font-medium text-slate-600">Enabled</span>
                       <div className="w-10 h-5 bg-green-500 rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                  ) : (
                    <div className="w-full bg-[#F3F4F6] border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-slate-100/50 transition-all cursor-pointer">
                       <Icon className="w-6 h-6 text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Drop {field.type}</span>
                    </div>
                  )}
                  
                  {/* Field-aligned Handle */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${field.id}-output`}
                    className="!bg-[#F59E0B]"
                    style={{ top: '50%', right: '-7px' }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RequestInputsNode