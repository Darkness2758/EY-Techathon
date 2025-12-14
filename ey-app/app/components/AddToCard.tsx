"use client";
import { Product } from "@/types/products";
import { useState } from "react";
import { useCart } from "../card/CardContext";
interface ButtonProps {
  className?: string;
  children: React.ReactNode;
}
export default function AddToCard({ className, children }: ButtonProps      
) {
  const { addToCart } = useCart(); 

  // Dummy product data for demonstration
  const product: Product = {
    id: 16,
    name: "Sample Product",
    price: 100,
    image: "/sample.jpg",
    description: "This is a sample product",
    rating: 4.5,
    category: "Sample Category",
    brand: "Sample Brand",
    sizes: ["S", "M", "L"],
    quantity: 10,
  };

  return (
    <>
      

      {/* ADD TO CART */}
      <button
         className={`px-4 py-2 bg-white text-black ${className}`}
        onClick={() => addToCart({ ...product, id: product.id.toString(), size: "M", qty: 1 })}
      >
        {children || "Add to Cart"}
      </button>
    </>
  );
}   
