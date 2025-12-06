type DataPointProps = {
  text: string
  positionClasses: string
  lineDirection: "left" | "right"
}

export default function DataPoint({
  text,
  positionClasses,
  lineDirection,
}: DataPointProps) {
  const isLeft = lineDirection === "left"

  return (
    <div className={`absolute ${positionClasses}`}>
      <div className={`flex items-center ${isLeft ? "flex-row-reverse" : ""}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
        <div
          className="h-px w-20 bg-white/50 relative mx-2"
          style={{
            transform: isLeft
              ? "rotate(10deg) translateX(-2px)"
              : "rotate(-10deg) translateX(2px)",
          }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 text-[10px] text-gray-300 uppercase whitespace-nowrap">
            {text}
          </div>
        </div>
      </div>
    </div>
  )
}
