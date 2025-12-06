import { ArrowRight, Minus } from "lucide-react"
import DataPoint from "./DataPoint"
import InfoCard from "./InfoCard"
import hoodie from "../../../public/hoodie.png"
import Image from "next/image"


export default function HeroSection() {
  return (
    <div className="flex items-center justify-center h-full w-full relative">
    <div className="absolute bottom-16 left-[10%] max-w-sm z-10">
      <div className="flex items-center space-x-2 mb-2">
        <Minus className="w-3 h-3 text-gray-400" />
        <span className="text-[8px] text-gray-400 font-mono tracking-widest">S: /</span>
      </div>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tighter uppercase mb-4">
        Your Ultimate Defense <br /> Against the Coldest Chill
      </h1>
      <p className="text-xs text-gray-400 max-w-xs font-mono mb-6">
        ***When winter's icy grip tightens____there's no room for compromise on warmth and protection.////
      </p>
      <button className="flex items-center space-x-2 text-xs uppercase tracking-widest border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors">
        <span>Shop now</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>

    <div className="relative z-10 mt-12">
      <img
        src={hoodie.src}
        alt="Person modeling a large, puffy, tan jacket and layered denim pants."
        className="w-150 h-auto object-cover transform translate-y-12 drop-shadow-2xl"
        style={{ filter: 'grayscale(10%)' }}
      />

      <div className="absolute top-0 left-0 -translate-x-12 -translate-y-8 p-3 border border-white/50 bg-neutral-900">
          <img src={hoodie.src} alt="Product thumbnail" className="w-10 h-10 object-cover" />
      </div>
    </div>

    <DataPoint
      text="Go to catalog now"
      positionClasses="top-[25%] left-[35%]"
      lineDirection="right"
    />

    <DataPoint
      text="Find out how cold our jackets can withstand"
      positionClasses="top-[45%] right-[25%]"
      lineDirection="left"
    />

    <div className="absolute bottom-16 right-[10%] max-w-xs z-10 flex flex-col space-y-4 w-[20rem]">
        <InfoCard />
    </div>
  </div>
  )
}
