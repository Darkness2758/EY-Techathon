"use client"
import Header from "../components/product/Header";
import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import SearchBar from "../components/collections/SearchBar";
 const handleSearch = (query) => {
    console.log("Searching for:", query);
  };
export default function ProductPage() {
const navItems = [
  { text: "Home", isActive: false, href: "/" },
  { text: "Collections", isActive: true, href: "/Collections" },
  { text: "About", isActive: false },
  { text: "Contact", isActive: false },
]
const products = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "https://www.onleyjames.com/cdn/shop/files/unisex-heavy-blend-hoodie-black-front-63f5352698fbf.jpg?v=1689511423&width=823"
  
    },
        {
        id: 2,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "https://www.onleyjames.com/cdn/shop/files/unisex-heavy-blend-hoodie-black-front-67881f330b817.jpg?v=1736975608&width=360",
                
  
    },
        {
        id: 3,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "https://www.onleyjames.com/cdn/shop/files/unisex-heavy-blend-hoodie-black-front-67881f330b817.jpg?v=1736975608&width=360",
                
  
    },

        {
        id: 4,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "https://www.onleyjames.com/cdn/shop/files/unisex-heavy-blend-hoodie-black-front-67881f330b817.jpg?v=1736975608&width=360",
                
  
    },
    
    {
        id: 5,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "https://www.onleyjames.com/cdn/shop/files/unisex-heavy-blend-hoodie-black-front-67881f330b817.jpg?v=1736975608&width=360",
                
  
    },


    
]

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200 overflow-hidden pl-12 pr-12 pt-16">
        <Header navItems={navItems} />
            <div className="flex flex-col items-center justify-center my-6  ">
      

      <SearchBar onSearch={handleSearch} />
    </div>
      <div className="text-center m-8 p-8 border border-gray-700 rounded-lg bg-neutral-800/50 shadow-lg  grid grid-cols-2" data-testid="featured-showcase" >
         <div> <h1 className=" text-4xl text-white-100 font-mono mb-4 " data-testid="showcase-heading">
            <Star className="inline-block h-10 w-10 text-black/15 mb-2 " />
            {" <"}Featured Showcase{ "> "}
            <Star className="inline-block h-10 w-10 text-black/15 mb-2 " />

          </h1>
          <hr className="border-amber-50/20 " />
          <p className="text-xl text-gray-600   "  data-testid="showcase-description">

            Discover our collection of premium products
          </p>
           <hr className="border-gray-700 " />
           </div>
<div>
          <img
            src="https://www.whitevictoria.com/image/cache/catalog/Article%20Cover/Stylish,%20Comfortable%20Work%20Outfits01-2280x600w.jpg"
            alt="Featured"
            width={500}
            height={500}
            className="w-full h-40 object-cover rounded-md mt-4"
          />
        </div>
          </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="featured-products-grid p-8 ">
          {products.map((product) => (
            <div
              key={product.id}
              className=" rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-700 bg-neutral-800/50"
              data-testid={`product-card-${product.id}`}
            >
              <div className="relative h-64 bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                   className="w-full h-full object-cover"
                  data-testid={`product-image-${product.id}`}
                />
                <div className="absolute bottom-2 right-2 bg-black text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  4.5
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-500 mb-2" data-testid={`product-name-${product.id}`}>
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4" data-testid={`product-description-${product.id}`}>
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white" data-testid={`product-price-${product.id}`}>
                    ${product.price}
                  </span>
                  <button
                    data-testid={`view-details-button-${product.id}`}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-500 transition-colors border border-white/20"
                  >
                    View Details
                  </button>
                  
                   </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      
   
  )
}