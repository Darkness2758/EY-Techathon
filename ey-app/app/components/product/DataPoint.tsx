interface DataPointProps {
  text: string
  positionClasses: string
}

export default function DataPoint({ text, positionClasses }: DataPointProps) {
  return (
    <div className={`absolute ${positionClasses}`}>
      <div className="flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="h-px w-20 bg-white/50 relative">
          <span className="absolute left-full ml-2 -translate-y-1/2 top-1/2 text-[10px] uppercase tracking-wider">
            {text}
          </span>
        </span>
      </div>
    </div>
  )
}
