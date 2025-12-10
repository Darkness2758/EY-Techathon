"use client"

import { useState, useMemo } from "react"
import { Star, Check } from "lucide-react"
import Header from "../components/landing/Header"
import SearchBar from "../components/collections/SearchBar"

import { PRODUCTS } from "../data"

export default function ProductPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [brands, setBrands] = useState<string[]>(["Wink", "Uniqlo", "Zara"])
  const [maxPrice, setMaxPrice] = useState(500)

  const categories = ["All", "Jacket", "Hoodie", "Gloves", "Pants"]
  const allBrands = ["Wink", "Uniqlo", "Zara"]

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        p.price <= maxPrice &&
        (category === "All" || p.category === category) &&
        brands.includes(p.brand)
      )
    })
  }, [search, category, brands, maxPrice])

  const toggleBrand = (b: string) =>
    setBrands(prev =>
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    )

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-300 font-mono">
      <Header
        navItems={[
          { text: "CATALOG", isActive: false },
          { text: "COLLECTIONS", isActive: true },
          { text: "ABOUT", isActive: false },
        ]}
      />

      <main className="pt-36 max-w-7xl mx-auto px-8 space-y-12">
        <div className="max-w-lg">
          <SearchBar onSearch={setSearch} />
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-12">
          <aside className="space-y-6 border border-white/10 bg-neutral-900 p-6 h-fit">
            <span className="text-xs uppercase tracking-widest text-gray-500">
              Filters
            </span>

            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Category
              </span>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`w-full text-left px-3 py-2 border text-xs transition
                    ${
                      c === category
                        ? "border-blue-400 text-blue-400"
                        : "border-white/10 hover:border-white/30"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Brand
              </span>
              {allBrands.map(b => (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  className={`flex items-center justify-between w-full px-3 py-2 border text-xs
                    ${
                      brands.includes(b)
                        ? "border-blue-400 text-blue-400"
                        : "border-white/10 hover:border-white/30"
                    }`}
                >
                  {b}
                  {brands.includes(b) && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Max Price
              </span>
              <input
                type="range"
                min={50}
                max={500}
                value={maxPrice}
                onChange={e => setMaxPrice(+e.target.value)}
                className="w-full accent-blue-400"
              />
              <span className="text-sm text-gray-400">₹ {maxPrice}</span>
            </div>
          </aside>

          <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map(p => (
              <div
                key={p.id}
                className="border border-white/10 bg-neutral-900 hover:border-blue-400 transition"
              >
                <div className="relative h-72">
                  <img
                    src={p.image}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 text-xs border border-blue-400 text-blue-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-blue-400" />
                    {p.rating}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <span className="text-xs uppercase text-gray-500">
                    {p.brand}
                  </span>

                  <h3 className="text-sm tracking-tight text-gray-200">
                    {p.name}
                  </h3>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-gray-400">₹ {p.price}</span>
                    <button className="px-4 py-2 text-xs uppercase tracking-widest border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}
