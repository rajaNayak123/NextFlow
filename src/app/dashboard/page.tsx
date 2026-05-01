'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Plus, Search, Key, Download, X, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import WorkflowCard from '@/components/dashboard/WorkflowCard'

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'workflows' | 'nodes'>('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [renameModal, setRenameModal] = useState<{open: boolean, id: string, name: string}>({open: false, id: '', name: ''})

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows')
      if (!res.ok) {
        setWorkflows([])
        setLoading(false)
        return
      }
      const data = await res.json()
      setWorkflows(Array.isArray(data) ? data : [])
    } catch (error) {
      setWorkflows([])
    } finally {
      setLoading(false)
    }
  }

  const createWorkflow = async () => {
    try {
      const res = await fetch('/api/workflows', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Untitled Workflow" })
      })
      if (!res.ok) throw new Error("Failed to create workflow")
      const workflow = await res.json()
      router.push(`/canvas/${workflow.id}`)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteWorkflow = async (id: string) => {
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Failed to delete workflow")
      fetchWorkflows()
    } catch (error) {
      console.error(error)
    }
  }

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const systemWorkflows = [
    {
      id: 'template-1',
      name: 'AI Racing Car Generator',
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: 'template-2',
        name: 'Hyper-Realistic Landscapes',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60'
      }
  ]

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-[#5e5ce6] border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-400 font-medium">Loading your workflows...</p>
    </div>
  )

  return (
    <div className="p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1 className="text-4xl font-[900] text-[#1a1c21] mb-2 tracking-[-0.04em]">Flow</h1>
          <p className="text-zinc-400 font-medium tracking-tight">Build workflows or run models directly.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#f1f3f5] rounded-xl text-sm font-bold text-[#1a1c21] hover:bg-[#f8f9fa] transition-all">
            <Key className="w-4 h-4" />
            API Keys
          </button>
          <button 
            onClick={() => {
               const input = document.createElement('input')
               input.type = 'file'
               input.accept = 'application/json'
               input.onchange = async (e: any) => {
                  const file = e.target.files[0]
                  if (file) {
                     const reader = new FileReader()
                     reader.onload = async (re) => {
                        try {
                           const workflowData = JSON.parse(re.target?.result as string)
                           const res = await fetch('/api/workflows', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                 name: workflowData.name + " (Imported)",
                                 nodes: workflowData.nodes,
                                 edges: workflowData.edges
                              })
                           })
                           if (res.ok) fetchWorkflows()
                        } catch (err) {
                           alert("Invalid JSON file")
                        }
                     }
                     reader.readAsText(file)
                  }
               }
               input.click()
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#f1f3f5] rounded-xl text-sm font-bold text-[#1a1c21] hover:bg-[#f8f9fa] transition-all"
          >
            <Download className="w-4 h-4" />
            Import
          </button>
          <button 
            onClick={createWorkflow}
            className="w-10 h-10 bg-[#1a1c21] text-white rounded-xl flex items-center justify-center hover:bg-black transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#f8f9fa] rounded-2xl w-fit mb-12">
        <button 
          onClick={() => setActiveTab('workflows')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'workflows' ? "bg-white text-[#1a1c21] shadow-sm" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          Workflows
        </button>
        <button 
          onClick={() => setActiveTab('nodes')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'nodes' ? "bg-white text-[#1a1c21] shadow-sm" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          Nodes
        </button>
      </div>

      {activeTab === 'workflows' ? (
        <>
          {/* System Workflows */}
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1a1c21] mb-1">System Workflows</h2>
              <p className="text-sm text-zinc-400 font-medium">Pre-built workflow templates — click to open and start using.</p>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
              {systemWorkflows.map(template => (
                <div key={template.id} className="min-w-[400px] group cursor-pointer">
                  <div className="bg-white rounded-[32px] overflow-hidden border border-[#f1f3f5] group-hover:shadow-lg transition-all duration-300">
                    <div className="aspect-[16/9] bg-[#f8f9fa] relative overflow-hidden">
                       <img src={template.image} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-[#1a1c21]">{template.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Workflows */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#1a1c21] mb-1">Your Workflows</h2>
                <p className="text-sm text-zinc-400 font-medium">Open one to edit, run, and review history.</p>
              </div>
              <div className="relative w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                 <input 
                    type="text" 
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#f8f9fa] border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#5e5ce6]/10"
                 />
              </div>
            </div>

            {filteredWorkflows.length === 0 ? (
              <div className="py-20 text-center bg-[#f8f9fa] rounded-[40px] border-2 border-dashed border-[#f1f3f5]">
                <p className="text-zinc-400 font-medium">No workflows found. Create your first one!</p>
                <button onClick={createWorkflow} className="mt-4 text-[#5e5ce6] font-bold hover:underline">
                   Create Workflow
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredWorkflows.map((workflow) => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow} 
                    onDelete={deleteWorkflow}
                    onRename={(w) => setRenameModal({open: true, id: w.id, name: w.name})}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-40 text-center">
            <h2 className="text-2xl font-bold text-[#1a1c21] mb-2">Custom Nodes</h2>
            <p className="text-zinc-400">You haven't created any custom nodes yet.</p>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal.open && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#f1f3f5] p-8 rounded-[32px] w-[450px] shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-[#1a1c21]">Rename Workflow</h2>
                <X className="w-5 h-5 text-zinc-300 cursor-pointer hover:text-zinc-600" onClick={() => setRenameModal({open: false, id: '', name: ''})} />
            </div>
            <input 
              type="text" 
              value={renameModal.name}
              onChange={(e) => setRenameModal({...renameModal, name: e.target.value})}
              className="w-full bg-[#f8f9fa] border-none rounded-2xl px-6 py-4 text-[#1a1c21] font-bold mb-8 focus:ring-2 focus:ring-[#5e5ce6]/10 transition-all"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setRenameModal({open: false, id: '', name: ''})} className="flex-1 px-6 py-4 rounded-2xl text-zinc-400 font-bold hover:bg-[#f8f9fa] transition-all">Cancel</button>
              <button 
                onClick={async () => {
                  const res = await fetch(`/api/workflows/${renameModal.id}`, { 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: renameModal.name }) 
                  })
                  if (res.ok) {
                    setRenameModal({open: false, id: '', name: ''})
                    fetchWorkflows()
                  }
                }}
                className="flex-1 px-6 py-4 bg-[#1a1c21] text-white rounded-2xl font-bold hover:bg-black transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#1a1c21] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40">
        <MessageSquare className="w-7 h-7" />
      </button>
    </div>
  )
}
