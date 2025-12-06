"use client"

export default function SizeSelector() {
  const sizes = ["S", "M", "L", "XL"]

  return (
    <div className="absolute right-8 top-[35%] flex flex-col space-y-3 font-mono z-10">
    {['S', 'M', 'L', 'XL'].map((size, index) => (
      <button
        key={size}
        className={`w-8 h-8 rounded-full border border-white flex items-center justify-center text-xs uppercase transition-all
          ${index === 3 ? 'bg-white text-black' : 'hover:bg-white/10 text-white'}
        `}
      >
        {size}
      </button>
    ))}
    <div className="text-xs text-gray-400 mt-6 text-right">2025</div>
  </div>
  )
}
