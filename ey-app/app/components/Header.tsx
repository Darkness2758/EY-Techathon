"use client"

import { useState, useEffect } from "react"
import DataStat from "./landing/DataStat"
import ScanOverlay from "./landing/ScanOverlay"
import AISupport from "./AIsupport"

type NavItem = {
  text: string
  isActive: boolean
}

type HeaderProps = {
  navItems: NavItem[]
}

export default function Header({ navItems }: HeaderProps) {
  const [aiMode, setAiMode] = useState<boolean>(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedAiMode = localStorage.getItem("aiMode")
    if (savedAiMode !== null) {
      setAiMode(savedAiMode === "true")
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("aiMode", String(aiMode))
    }
  }, [aiMode, isMounted])

  const toggleAiMode = () => {
    if (isScanning) return

    if (!aiMode) {
      setIsScanning(true)
      setTimeout(() => {
        setIsScanning(false)
        setAiMode(true)
      }, 1500)
    } else {
      setAiMode(false)
    }
  }

  if (!isMounted) {
    return (
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10 font-mono">
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <button
              key={item.text}
              className={`px-4 py-2 text-xs uppercase tracking-widest border border-current transition-colors
                ${item.isActive ? "bg-white text-black" : "hover:bg-gray-800"}
              `}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-400">Loading...</div>
      </header>
    )
  }

  return (
    <>
      {isScanning && <ScanOverlay />}
      {aiMode && <AISupport />}

      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10 font-mono">
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <button
              key={item.text}
              className={`px-4 py-2 text-xs uppercase tracking-widest border border-current transition-colors
                ${item.isActive ? "bg-white text-black" : "hover:bg-gray-800"}
              `}
            >
              {item.text}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div className="flex space-x-4 text-xs font-light tracking-wider">
            <DataStat value="<100>" label="New collections of winter jackets" />
            <DataStat value="<300>" label="Stylish dressed people with our things" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAiMode}
              className="relative w-12 h-6 border border-yellow-300 rounded-full bg-neutral-800 focus:outline-none"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-black transition-transform duration-300 rounded-full border-yellow-200 border
                  ${aiMode ? "translate-x-6" : ""}
                `}
              />
            </button>
            <DataStat label="AI mode is" />
            {aiMode ? (
              <span className="text-yellow-300 text-xs">On</span>
            ) : (
              <span className="text-gray-400 text-xs">Off</span>
            )}
          </div>
        </div>
      </header>
    </>
  )
}