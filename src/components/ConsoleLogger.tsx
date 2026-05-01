'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ConsoleLogger() {
  const pathname = usePathname()
  
  useEffect(() => {
    console.log('nextflow Candidate Linkedin: https://www.linkedin.com/in/raja-nayak/')
  }, [pathname])
  
  return null
}
