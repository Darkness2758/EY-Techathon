import Header from "../components/product/Header"
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function ProductPage() {
const navItems = [
 
  { text: "About", isActive: false },
  { text: "Contact", isActive: false },
]
const products = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "data:image/jpeg;base64,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",
                
  
    },
        {
        id: 2,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "https://www.onleyjames.com/products/i-have-a-pinterest-board-unisex-hoodie?srsltid=AfmBOoo4gzuixjakuq3svoyzox4YNWI9KAjFp-A8ZqeRr38Nfcqq6HTA",
                
  
    },
        {
        id: 3,
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear sound with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.",
        price: 299.99,
        image: "https://www.onleyjames.com/products/i-have-a-pinterest-board-unisex-hoodie?srsltid=AfmBOoo4gzuixjakuq3svoyzox4YNWI9KAjFp-A8ZqeRr38Nfcqq6HTA",
                
  
    },

    
]

  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-hidden pl-12 pr-12 ">
        <Header navItems={navItems} />
      <div className="text-center m-12 ">
          <h1 className="text-4xl font-bold text-white-900 mb-4" data-testid="showcase-heading">
            <Star className="inline-block h-10 w-10 text-purple-500 mb-2" />
            Featured Showcase
          </h1>
          <p className="text-xl text-gray-600" data-testid="showcase-description">
            Discover our collection of premium products
          </p>
          </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="featured-products-grid p-8 ">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-cyan-950/50 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              data-testid={`product-card-${product.id}`}
            >
              <div className="relative h-64 bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                   className="w-full h-full object-cover"
                  data-testid={`product-image-${product.id}`}
                />
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`product-name-${product.id}`}>
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4" data-testid={`product-description-${product.id}`}>
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600" data-testid={`product-price-${product.id}`}>
                    ${product.price}
                  </span>
                  <button
                    data-testid={`view-details-button-${product.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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