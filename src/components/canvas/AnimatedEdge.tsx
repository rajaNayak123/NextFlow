import React from 'react'
import { EdgeProps, getBezierPath } from 'reactflow'

export default function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY })
  
  return (
    <>
      <path
        id={id}
        className="stroke-zinc-400/60 stroke-2 fill-none transition-colors group-hover:stroke-blue-400"
        d={edgePath}
        markerEnd="url(#arrow)"
      />
      <path
        className="stroke-blue-500/80 stroke-[4px] fill-none opacity-0 group-hover:opacity-100 transition-all duration-300 edge-flow-animation"
        d={edgePath}
        strokeLinecap="round"
      />
    </>
  )
}