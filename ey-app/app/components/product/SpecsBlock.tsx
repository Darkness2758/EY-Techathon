import { Zap } from "lucide-react"

type SpecItem = {
  label: string
  value: string
}

interface SpecsBlockProps {
  title?: string
  code?: string
  specs: SpecItem[]
}

export default function SpecsBlock({
  title = "Key Specifications",
  code = "D-998",
  specs,
}: SpecsBlockProps) {
  return (
    <div className="border border-white/30 bg-neutral-900/50 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest font-mono flex items-center gap-2">
          <Zap className="w-3 h-3 text-red-400" />
          {title}
        </h3>
        <span className="text-[10px] font-mono text-gray-400">
          {code}
        </span>
      </div>
      <div className="h-px bg-white/20" />

      <ul className="space-y-2 text-xs">
        {specs.map(({ label, value }) => (
          <li
            key={label}
            className="flex justify-between items-center group"
          >
            <span className="text-gray-400 uppercase tracking-wider">
              {label}
            </span>
            <span className="text-white group-hover:text-red-400 transition-colors">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
