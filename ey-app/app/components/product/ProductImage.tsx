import { Maximize2 } from "lucide-react"
import DataPoint from "./DataPoint"
import hoodie from "../../../public/hoodie.png"

export default function ProductImage() {
  return (
    <div className="relative w-180 h-140 mr-16">
      <img
        src={hoodie.src}
        className="w-[90%] h-[105%] p-5 obsject-cover border border-white/20"
      />

      <div className="absolute top-4 right-4 p-2 border border-white/20 bg-black/70">
        <Maximize2 className="w-4 h-4" />
      </div>

      <DataPoint text=" " positionClasses="top-[10%] -right-24" />
      <DataPoint text="Aero-Core 3L Fabric" positionClasses="bottom-[10%] -right-24" />
    </div>
  )
}
