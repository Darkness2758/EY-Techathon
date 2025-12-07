import Header from "../components/product/Header"
export default function ProductPage() {
  const navItems = [
   
    { text: "About", isActive: false },
    { text: "Contact", isActive: false },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-hidden">
        <Header navItems={navItems} />

      </div>
      
   
  )
}