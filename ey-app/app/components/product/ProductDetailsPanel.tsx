"use client"
import AddToCart from "../AddToCard"
import { useState } from "react"
import SizeSelector from "./SizeSelector"
import SpecsBlock from "./SpecsBlock"

const SPECS = [
  { label: "Material", value: "Aero-Core 3L Fabric" },
  { label: "Insulation", value: "800-Fill Hyper-Down" },
  { label: "Waterproof", value: "20,000 mm" },
  { label: "Weight", value: "1.2 kg (Size L)" },
]

export default function ProductDetailsPanel() {
  const [size, setSize] = useState("L")

  return (
    <div className="max-w-lg p-8 border border-white/20 font-mono">
      <div className="border-b border-white/20 pb-4 mb-4">
                <h1 className="text-3xl font-extrabold uppercase mb-2 leading-none">
                    Chrono-Clad Jacket 
                </h1>
                <p className="text-2xl font-bold">₹1009.00</p>
            </div>

      <SizeSelector
        sizes={["S", "M", "L", "XL", "2XL"]}
        selected={size}
        onChange={setSize}
      />

      <div className="mt-2">
      <SpecsBlock specs={SPECS} />
      </div>
     <AddToCart>Add TO CARD </AddToCart>
    </div>
  )
}
