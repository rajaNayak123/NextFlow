import HistoryPanel from '@/components/canvas/HistoryPanel'

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {children}
      <HistoryPanel />
    </div>
  )
}