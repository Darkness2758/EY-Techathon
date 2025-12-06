interface Props {
  sizes: string[]
  selected: string
  onChange: (s: string) => void
}

export default function SizeSelector({ sizes, selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`py-2 text-xs uppercase border ${
            selected === size
              ? "bg-white text-black"
              : "border-white/40 hover:bg-white/10"
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  )
}
