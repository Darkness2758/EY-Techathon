"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react"
import DataStat from "./DataStat"

interface NavItem {
  text: string
  isActive: boolean
  href?: string
}

export default function Header({ navItems }: { navItems: NavItem[] }) {
  const router = useRouter()

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10 font-mono">
      <div className="flex space-x-6">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 text-xs uppercase tracking-widest border border-white
          hover:bg-white hover:text-black transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Home</span>
        </button>

        {navItems.map((item) => (
          <button
            key={item.text}
            onClick={() => handleNavClick(item)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors
              ${item.isActive ? "bg-white text-black" : "border-white hover:bg-white hover:text-black"}
            `}
           
          >
            {item.text}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex space-x-4">
          <DataStat value="<02>" label="Variants" />
          <DataStat value="<10>" label="Colors" />
        </div>
        <Heart className="w-5 h-5 cursor-pointer" />
   
        <ShoppingCart className="w-5 h-5 cursor-pointer" />
         
      </div>
    </header>
  )
}
