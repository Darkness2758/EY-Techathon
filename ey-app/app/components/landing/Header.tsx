import { ShoppingCart, Heart } from "lucide-react"
import DataStat from "./DataStat"
import Switch from "./switch"
type NavItem = {
  text: string
  isActive: boolean
}

type HeaderProps = {
  navItems: NavItem[]
}

export default function Header({ navItems }: HeaderProps) {
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

      <div className="flex items-center space-x-6 text-sm">
        <div className="flex space-x-4 text-xs font-light tracking-wider">
          <DataStat value="<100>" label="New collections of winter jackets" />
          <DataStat value="<300>" label="Stylish dressed people with our things" />
        </div>

        <div className="flex space-x-4 text-white">
          <Heart className="w-5 h-5 cursor-pointer" />
          <ShoppingCart className="w-5 h-5 cursor-pointer" />
          <Switch />

           
        </div>
      </div>
    </header>
  )
}
