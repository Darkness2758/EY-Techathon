"use client"

import AboutUs from "../../about/about"
import Header from "./Header"
import HeroSection from "./HeroSection"
import SidebarIndicators from "./SidebarIndicators"
import SizeSelector from "./SizeSelector"

export default function Landing() {
  const navItems = [
    { text: "Home", isActive: true },
    { text: "Collections", isActive: false, href: "/collections" },
    { text: "Contact Us", isActive: false },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-hidden">
      <Header navItems={navItems} />
      <SidebarIndicators />
      <SizeSelector />
      <HeroSection />
      <div className="custom-shape-divider-top-1765038044 mb-0">
      <svg
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M1200 0L0 0 892.25 114.72 1200 0z"
          className="shape-fill fill-neutral-800"
        />
      </svg>
    </div>
      <AboutUs />
    </div>
  )
}
