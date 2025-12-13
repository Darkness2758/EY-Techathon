import { Product } from "../types/products"
import productsData from "../Collections/data/products.json"

export async function getProducts(): Promise<Product[]> {
  try {
    return productsData as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export function getUniqueBrands(products: Product[]): string[] {
  return Array.from(new Set(products.map(p => p.brand)))
}

export function getUniqueCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map(p => p.category)))
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = productsData as Product[]
  const lowerQuery = query.toLowerCase()
  
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.brand.toLowerCase().includes(lowerQuery) ||
    product.description?.toLowerCase().includes(lowerQuery)
  )
}

export async function getRecommendations(): Promise<Product[]> {
  const products = productsData as Product[]
  return products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = productsData as Product[]
  return products.filter(p => p.category === category)
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const products = productsData as Product[]
  return products.filter(p => p.brand === brand)
}

export async function generateAIResponse(userMessage: string): Promise<{
  response: string
  relatedProducts?: Product[]
  action?: 'show_products' | 'show_categories' | 'show_recommendations'
}> {
  const lowerMessage = userMessage.toLowerCase()
  const products = productsData as Product[]

  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('₹')) {
    const priceMatch = userMessage.match(/₹?\s*(\d+)/)
    if (priceMatch) {
      const maxPrice = parseInt(priceMatch[1])
      const affordableProducts = products.filter(p => p.price <= maxPrice)
      return {
        response: `I found ${affordableProducts.length} products under ₹${maxPrice}. Would you like me to show them?`,
        relatedProducts: affordableProducts,
        action: 'show_products'
      }
    }
    return {
      response: "Our prices range from ₹150 to ₹500. You can use the price filter on the left to find products within your budget. Would you like me to show you some affordable options?"
    }
  }

  const categories = ['jacket', 'hoodie', 'gloves', 'pants']
  const matchedCategory = categories.find(cat => lowerMessage.includes(cat))
  if (matchedCategory) {
    const categoryProducts = await getProductsByCategory(matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1))
    return {
      response: `Here are our ${matchedCategory}s. We have ${categoryProducts.length} items in this category.`,
      relatedProducts: categoryProducts,
      action: 'show_products'
    }
  }

  const brands = ['wink', 'uniqlo', 'zara']
  const matchedBrand = brands.find(brand => lowerMessage.includes(brand))
  if (matchedBrand) {
    const brandProducts = await getProductsByBrand(matchedBrand.charAt(0).toUpperCase() + matchedBrand.slice(1))
    return {
      response: `Here are products from ${matchedBrand.toUpperCase()}. We have ${brandProducts.length} items from this brand.`,
      relatedProducts: brandProducts,
      action: 'show_products'
    }
  }

  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('popular')) {
    const recommendations = await getRecommendations()
    return {
      response: "Based on customer ratings, here are our top recommendations:",
      relatedProducts: recommendations,
      action: 'show_recommendations'
    }
  }

  if (lowerMessage.includes('look') || lowerMessage.includes('find') || lowerMessage.includes('search')) {
    const searchTerm = lowerMessage.replace(/.*?(look|find|search)\s+for\s+(.*?)(?:\s+please)?$/i, '$2').trim()
    if (searchTerm && searchTerm !== lowerMessage) {
      const foundProducts = await searchProducts(searchTerm)
      return {
        response: foundProducts.length > 0 
          ? `I found ${foundProducts.length} products matching "${searchTerm}":`
          : `No products found matching "${searchTerm}". Would you like to try a different search?`,
        relatedProducts: foundProducts,
        action: 'show_products'
      }
    }
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      response: "Hello! I'm your AI fashion assistant. I can help you find products, check prices, get recommendations, and more. How can I assist you today?"
    }
  }

  const defaultResponses = [
    "I can help you find products, check prices, or get recommendations. Try asking me about jackets, hoodies, or specific brands like Wink or Uniqlo.",
    "I have access to our full product catalog. You can ask me about specific items, prices, or get personalized recommendations.",
    "Feel free to ask me anything about our products! I can help you search, compare, and find the perfect items for you."
  ]
  
  return {
    response: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }
}