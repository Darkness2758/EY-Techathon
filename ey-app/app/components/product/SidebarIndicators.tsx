export default function SidebarIndicators() {
  return (
    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-12 z-10">
    <div className="relative h-24 w-12 flex items-center justify-center -rotate-90">
      <div className="absolute inset-0 border w-15 border-white/20"></div>
      <div className="text-white font-mono text-lg tracking-[0.2em] rotate-180">D-998</div>
    </div>
    <div className="flex flex-col space-y-3 mt-10">
      <div className="w-2 h-2 rounded-full bg-white"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
    </div>
  </div>
  )
}
