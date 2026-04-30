import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Settings, Compass, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Sidebar() {
  return (
    <div className="w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between p-6 h-screen sticky top-0">
      <div>
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Galaxy.ai</span>
        </div>
        
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/10">
            <LayoutDashboard className="w-5 h-5 text-purple-400" />
            Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-all">
            <Compass className="w-5 h-5" />
            Explore
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 mt-auto">
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }} />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">Account</span>
          <span className="text-xs text-zinc-400">Manage profile</span>
        </div>
      </div>
    </div>
  )
}
