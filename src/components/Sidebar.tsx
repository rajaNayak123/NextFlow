'use client'
import { UserButton, useUser } from "@clerk/nextjs"
import { 
  LayoutGrid, 
  CreditCard, 
  Users, 
  MessageSquare, 
  ChevronDown, 
  Search, 
  PanelLeft
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const { user } = useUser()

  return (
    <div className="w-[280px] bg-[#f8f9fa] border-r border-[#f1f3f5] flex flex-col h-screen sticky top-0">
      {/* Header & Logo */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#1a1c21] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#1a1c21]" />
            </div>
            <span className="text-2xl font-[900] tracking-[-0.05em] text-[#1a1c21]">Galaxy</span>
          </div>
          <PanelLeft className="w-5 h-5 text-zinc-400 cursor-pointer" />
        </div>

        {/* Quick Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Quick search..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#f1f3f5] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5e5ce6]/10 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-300 tracking-tighter border border-zinc-100 px-1 rounded">
            ⌘K
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <Link href="/dashboard" className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white shadow-sm border border-[#f1f3f5] text-[#1a1c21] font-semibold text-sm transition-all">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4" />
              All Tools
            </div>
            <span className="text-[10px] font-black bg-[#eef2ff] text-[#5e5ce6] px-2 py-0.5 rounded-full">5933</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-[#1a1c21] hover:bg-white/50 font-bold text-sm transition-all">
            <CreditCard className="w-4 h-4" />
            Free Credits
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-[#1a1c21] hover:bg-white/50 font-bold text-sm transition-all">
            <Users className="w-4 h-4" />
            Become an Affiliate
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-[#1a1c21] hover:bg-white/50 font-bold text-sm transition-all">
            <MessageSquare className="w-4 h-4" />
            Feature Requests
          </Link>
        </nav>

        {/* Categories */}
        <div className="mt-10 space-y-6">
          <div>
            <div className="flex items-center justify-between px-3 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer group">
              Unfair Advantage
              <ChevronDown className="w-4 h-4 group-hover:text-zinc-600 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between px-3 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer group">
              Generation History
              <ChevronDown className="w-4 h-4 group-hover:text-zinc-600 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between px-3 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer group">
              Favorites
              <ChevronDown className="w-4 h-4 group-hover:text-zinc-600 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between px-3 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer group">
              Popular
              <ChevronDown className="w-4 h-4 group-hover:text-zinc-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
      
      {/* User Section */}
      <div className="mt-auto px-6 py-8 border-t border-[#f1f3f5]">
        <div className="flex items-center gap-3 group cursor-pointer">
           <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg" } }} />
           <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#1a1c21] truncate">{user?.fullName || 'Raja Nayak'}</div>
           </div>
           <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
        </div>
      </div>
    </div>
  )
}
