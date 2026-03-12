'use client'

import { useState } from 'react'

interface TooltipProps {
  text: string
  children?: React.ReactNode
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children || (
          <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-400 text-xs font-bold hover:bg-primary-500/30 hover:border-primary-500/60 transition-all">
            !
          </div>
        )}
      </div>
      
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-4 py-3 bg-slate-900 border border-white/20 rounded-xl shadow-2xl text-sm text-slate-200 leading-relaxed animate-fade-in">
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-900"></div>
          {text}
        </div>
      )}
    </div>
  )
}
