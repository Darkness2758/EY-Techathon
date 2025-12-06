"use client"

import { ArrowRight } from "lucide-react"

export default function SidebarIndicators() {
  return (
    <aside className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-12 z-10">
      <div className="flex flex-col space-y-3 mt-10">
        <span className="w-2 h-2 rounded-full bg-white" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
      </div>

    </aside>
  )
}
