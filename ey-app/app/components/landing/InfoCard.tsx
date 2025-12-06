"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"

type InfoSlide = {
  title: string
  features: string[]
}

const SLIDES: InfoSlide[] = [
  {
    title: "Unyielding Protection",
    features: [
      "Uncompromising comfort",
      "Water & wind resistant",
      "Fully sealed seams",
    ],
  },
  {
    title: "Built for Extremes",
    features: [
      "Thermal insulation core",
      "Reinforced outer shell",
      "Designed for sub-zero climates",
    ],
  },
  {
    title: "Engineered Design",
    features: [
      "Ergonomic fit",
      "Lightweight construction",
      "Minimal heat loss",
    ],
  },
]

export default function InfoCard() {
  const [active, setActive] = useState(0)

  const prev = () =>
    setActive((i) => (i === 0 ? SLIDES.length - 1 : i - 1))

  const next = () =>
    setActive((i) => (i === SLIDES.length - 1 ? 0 : i + 1))

  const current = SLIDES[active]

  return (
    <div className="w-full space-y-4">
      <div className="relative p-5 border border-white/40 bg-black/40 backdrop-blur-sm">
        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest">
          <div className="flex items-center space-x-2 text-gray-400">
            <button onClick={prev} aria-label="Previous slide">
              <ChevronLeft className="w-3 h-3 hover:text-white transition-colors" />
            </button>
            <button onClick={next} aria-label="Next slide">
              <ChevronRight className="w-3 h-3 hover:text-white transition-colors" />
            </button>
          </div>
          <div className="flex space-x-1">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`text-xs ${
                  i === active ? "text-white" : "text-gray-600"
                }`}
              >
                {i === active ? "◉" : "○"}
              </span>
            ))}
          </div>
        </div>

        <div className="my-4 h-px bg-white/20" />

        <h3 className="text-sm font-extrabold uppercase tracking-tight mb-3">
          {current.title}
        </h3>

        <ul className="space-y-2 text-xs text-gray-300">
          {current.features.map((item) => (
            <li
              key={item}
              className="flex items-center space-x-2 group"
            >
              <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
              <span className="group-hover:text-white transition-colors">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-between items-center">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">
            Slide {active + 1} / {SLIDES.length}
          </span>
          <button className="px-3 py-1 text-[10px] uppercase tracking-widest border border-white/50 hover:bg-white hover:text-black transition-all">
            More
          </button>
        </div>
      </div>

      <Link href="/product">
  <div className="relative h-24 cursor-pointer group">
    <img
      src="https://i.pinimg.com/1200x/a3/a1/6b/a3a16bd1f3d0f9e83cf8fc37fc193b30.jpg"
      alt="Premium winter jacket detail"
      className="absolute right-0 bottom-0 w-20 h-20 object-cover border border-white
                 group-hover:scale-105 transition-transform duration-300"
    />

    <Heart
      className="absolute top-1 right-24 w-4 h-4 text-white
                 group-hover:text-red-500 transition-colors"
    />
  </div>
</Link>

    </div>
  )
}
