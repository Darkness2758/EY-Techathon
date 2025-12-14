import Header from "../components/product/Header"
import SidebarIndicators from "../components/product/SidebarIndicators"
import ProductImage from "../components/product/ProductImage"
import ProductDetailsPanel from "../components/product/ProductDetailsPanel"

export default function ProductPage() {
  const navItems = [
    { text: "Catalog", isActive: true },
    { text: "About", isActive: false },
    { text: "Contact", isActive: false },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-hidden">
      <Header navItems={navItems} />
      <SidebarIndicators />

      <div className="flex justify-center pt-32 px-12">
        <ProductImage />
        <ProductDetailsPanel  />
      </div>
    </div>
  )
}
