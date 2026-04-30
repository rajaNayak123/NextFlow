'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Plus, Edit, Trash2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      if (Array.isArray(data)) {
        setWorkflows(data)
      } else {
        setWorkflows([])
      }
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

  const openRename = (workflow: any) => {
    setRenameModal({open: true, id: workflow.id, name: workflow.name})
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            My Workflows
          </h1>
          <button
            onClick={createWorkflow}
            className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Create New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="group">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white truncate max-w-[200px]">
                    {workflow.name}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/20 rounded-xl">
                      <Play className="w-4 h-4" />
                    </button>
                    <button onClick={() => openRename(workflow)} className="p-2 hover:bg-white/20 rounded-xl">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="p-2 hover:bg-red-500/20 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div>Last edited {new Date(workflow.updatedAt).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      workflow.status === 'running' ? 'bg-green-500/20 text-green-400 border-green-500/30 border' :
                      workflow.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border' :
                      'bg-zinc-500/20 text-zinc-400 border-zinc-500/30 border'
                    )}>
                      {workflow.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/canvas/${workflow.id}`)}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  Open Canvas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {renameModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/20 p-6 rounded-2xl w-96">
            <h2 className="text-xl font-bold text-white mb-4">Rename Workflow</h2>
            <input 
              type="text" 
              value={renameModal.name}
              onChange={(e) => setRenameModal({...renameModal, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameModal({open: false, id: '', name: ''})} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
              <button 
                onClick={async () => {
                  const res = await fetch(`/api/workflows/${renameModal.id}`, { 
                    method: 'PUT', 
                    body: JSON.stringify({ name: renameModal.name }) 
                  })
                  if (res.ok) {
                    setRenameModal({open: false, id: '', name: ''})
                    fetchWorkflows()
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}