type DataStatProps = {
  value?: string
  label: string
}

export default function DataStat({ value, label }: DataStatProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white text-base">{value}</span>
      <span className="text-gray-400 text-[8px] uppercase">{label}</span>
    </div>
  )
}
