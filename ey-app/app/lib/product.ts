import { Product } from "../types/products"
import productsData from "../Collections/data/products.json"
import { IntentDetector, ResponseGenerator } from "./nlp"
import { ProductRanker } from "./ranking"
import type { NLPResponse, Intent } from "./nlp/types"

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

export async function getRecommendations(
  limit: number = 3,
  intent?: Intent,
  userPreferences?: any
): Promise<Product[]> {
  const products = productsData as Product[]
  
  let filteredProducts = [...products]
  
  // Apply filters based on intent if provided
  if (intent) {
    if (intent.entities.category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase().includes(intent.entities.category!.toLowerCase())
      )
    }
    
    if (intent.entities.priceRange) {
      const { min, max } = intent.entities.priceRange
      filteredProducts = filteredProducts.filter(p => {
        if (min && max) return p.price >= min && p.price <= max
        if (max) return p.price <= max
        if (min) return p.price >= min
        return true
      })
    }
    
    if (intent.entities.brand) {
      filteredProducts = filteredProducts.filter(p => 
        p.brand.toLowerCase().includes(intent.entities.brand!.toLowerCase())
      )
    }
  }
  
  // Apply user preferences
  if (userPreferences) {
    if (userPreferences.preferredCategories?.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        userPreferences.preferredCategories.includes(p.category)
      )
    }
    
    if (userPreferences.favoriteBrands?.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        userPreferences.favoriteBrands.includes(p.brand)
      )
    }
    
    if (userPreferences.priceRange) {
      const { min, max } = userPreferences.priceRange
      filteredProducts = filteredProducts.filter(p => 
        p.price >= min && p.price <= max
      )
    }
  }
  
  // Default: sort by rating, but respect intent parameters
  const sortBy = intent?.parameters.sortBy || 'rating'
  const sortOrder = intent?.parameters.sortOrder || 'desc'
  
  return filteredProducts
    .sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      } else if (sortBy === 'rating') {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating
      }
      return 0
    })
    .slice(0, limit || intent?.parameters.limit || 3)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = productsData as Product[]
  return products.filter(p => 
    p.category.toLowerCase() === category.toLowerCase() ||
    p.category.toLowerCase().includes(category.toLowerCase())
  )
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const products = productsData as Product[]
  return products.filter(p => 
    p.brand.toLowerCase() === brand.toLowerCase() ||
    p.brand.toLowerCase().includes(brand.toLowerCase())
  )
}

export async function getProductsByPriceRange(
  min?: number, 
  max?: number
): Promise<Product[]> {
  const products = productsData as Product[]
  
  return products.filter(product => {
    if (min && max) {
      return product.price >= min && product.price <= max
    } else if (max) {
      return product.price <= max
    } else if (min) {
      return product.price >= min
    }
    return true
  })
}

export async function getProductsByFeatures(features: string[]): Promise<Product[]> {
  const products = productsData as Product[]
  
  return products.filter(product => {
    return features.some(feature => {
      const [type, value] = feature.split(':')
      if (!value) return false
      
      switch (type) {
        case 'color':
          return product.name.toLowerCase().includes(value.toLowerCase()) ||
                 product.description?.toLowerCase().includes(value.toLowerCase())
        case 'material':
          return product.description?.toLowerCase().includes(value.toLowerCase())
        default:
          return false
      }
    })
  })
}

export async function getTrendingProducts(limit: number = 5): Promise<Product[]> {
  const products = productsData as Product[]
  
  // Simulate trending based on rating and recency (higher id = newer)
  return products
    .sort((a, b) => {
      // Weight rating higher than recency
      const scoreA = (a.rating * 0.7) + (a.id / 1000 * 0.3)
      const scoreB = (b.rating * 0.7) + (b.id / 1000 * 0.3)
      return scoreB - scoreA
    })
    .slice(0, limit)
}

export async function getNewArrivals(limit: number = 5): Promise<Product[]> {
  const products = productsData as Product[]
  
  // Assuming higher ID = newer product
  return products
    .sort((a, b) => b.id - a.id)
    .slice(0, limit)
}

export async function getPersonalizedRecommendations(
  userPreferences: any,
  limit: number = 5
): Promise<Product[]> {
  const products = productsData as Product[]
  
  let filteredProducts = [...products]
  
  // Apply user preferences
  if (userPreferences.preferredCategories?.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      userPreferences.preferredCategories.includes(p.category)
    )
  }
  
  if (userPreferences.favoriteBrands?.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      userPreferences.favoriteBrands.includes(p.brand)
    )
  }
  
  if (userPreferences.priceRange) {
    const { min, max } = userPreferences.priceRange
    filteredProducts = filteredProducts.filter(p => 
      p.price >= min && p.price <= max
    )
  }
  
  // Consider seasonal relevance
  const currentSeason = getCurrentSeason()
  const seasonalMultiplier = getSeasonalMultiplierForProducts(filteredProducts, currentSeason)
  
  // Sort by combined score (rating + seasonal relevance)
  return filteredProducts
    .map(product => {
      const seasonalBoost = seasonalMultiplier[product.category] || 1
      const score = product.rating * seasonalBoost
      return { product, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product)
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 11 || month <= 1) return 'Winter'
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  return 'Autumn'
}

function getSeasonalMultiplierForProducts(products: Product[], season: string): Record<string, number> {
  const seasonalMultipliers: Record<string, Record<string, number>> = {
    Winter: { 'Jacket': 1.8, 'Gloves': 1.6, 'Hoodie': 1.4, 'Pants': 1.2 },
    Summer: { 'Jacket': 0.6, 'Gloves': 0.4, 'Hoodie': 0.7, 'Pants': 1.4 },
    Spring: { 'Jacket': 1.2, 'Gloves': 0.8, 'Hoodie': 1.3, 'Pants': 1.5 },
    Autumn: { 'Jacket': 1.5, 'Gloves': 1.2, 'Hoodie': 1.6, 'Pants': 1.3 }
  }
  
  const multipliers = seasonalMultipliers[season] || {}
  const result: Record<string, number> = {}
  
  products.forEach(product => {
    result[product.category] = multipliers[product.category] || 1.0
  })
  
  return result
}

export async function generateAIResponse(
  userMessage: string, 
  nlpResponse?: NLPResponse
): Promise<{
  response: string
  relatedProducts: Product[]
  action: Intent['type']
  nlpData?: NLPResponse
}> {
  // Use NLP to analyze the query if not provided
  const nlp = nlpResponse || IntentDetector.detectIntent(userMessage)
  
  const allProducts = await getProducts()
  let filteredProducts: Product[] = []
  
  // Generate conversational responses based on intent
  let responseText = ""
  
  switch (nlp.intent.type) {
    case 'show_products':
      filteredProducts = await filterProductsByIntent(nlp.intent, allProducts)
      if (filteredProducts.length > 0) {
        responseText = `I found ${filteredProducts.length} products matching your search. Here are the best matches:`
      } else {
        responseText = "I couldn't find any products matching your criteria. Would you like to try a different search?"
      }
      break
      
    case 'show_recommendations':
      filteredProducts = await getPersonalizedRecommendations(
        nlp.intent.entities,
        nlp.intent.parameters.limit || 5
      )
      responseText = "Based on your preferences, here are my top recommendations:"
      break
      
    case 'show_categories':
      const categories = getUniqueCategories(allProducts)
      responseText = `We have products in these categories: ${categories.join(', ')}. Which category interests you?`
      filteredProducts = allProducts.slice(0, 3) // Show a few sample products
      break
      
    case 'price_query':
      filteredProducts = await getProductsByPriceRange(
        nlp.intent.entities.priceRange?.min,
        nlp.intent.entities.priceRange?.max
      )
      if (filteredProducts.length > 0) {
        const priceRange = nlp.intent.entities.priceRange
        const rangeText = priceRange?.max ? `under ₹${priceRange.max}` : 
                         priceRange?.min ? `above ₹${priceRange.min}` : 
                         'in your price range'
        responseText = `I found ${filteredProducts.length} products ${rangeText}. Here are the best options:`
      } else {
        responseText = "No products found in that price range. Would you like to adjust your budget?"
      }
      break
      
    case 'brand_query':
      filteredProducts = await getProductsByBrand(nlp.intent.entities.brand || '')
      if (filteredProducts.length > 0) {
        responseText = `Here are ${filteredProducts.length} products from ${nlp.intent.entities.brand}:`
      } else {
        responseText = `We don't have products from ${nlp.intent.entities.brand} currently. Would you like to see products from other brands?`
      }
      break
      
    case 'comparison':
      // For comparison, show top-rated products in the category
      if (nlp.intent.entities.category) {
        filteredProducts = await getProductsByCategory(nlp.intent.entities.category)
        filteredProducts = filteredProducts.sort((a, b) => b.rating - a.rating).slice(0, 3)
        responseText = `Here are the top-rated ${nlp.intent.entities.category}s for comparison:`
      } else {
        filteredProducts = await getRecommendations(3, nlp.intent)
        responseText = "Here are some products you might want to compare:"
      }
      break
      
    case 'general_help':
      const trending = await getTrendingProducts(2)
      filteredProducts = trending
      responseText = `I'm here to help! I can assist you with finding products, recommendations, price comparisons, and more. Here's what's trending right now:`
      break
  }
  
  // Apply sorting and limiting
  if (nlp.intent.parameters.sortBy) {
    filteredProducts.sort((a, b) => {
      if (nlp.intent.parameters.sortBy === 'price') {
        return nlp.intent.parameters.sortOrder === 'asc' 
          ? a.price - b.price 
          : b.price - a.price
      } else if (nlp.intent.parameters.sortBy === 'rating') {
        return nlp.intent.parameters.sortOrder === 'asc'
          ? a.rating - b.rating
          : b.rating - a.rating
      } else if (nlp.intent.parameters.sortBy === 'name') {
        return nlp.intent.parameters.sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      return 0
    })
  }
  
  // Apply limit
  const limit = nlp.intent.parameters.limit || 
    (nlp.intent.type === 'show_recommendations' ? 5 : 10)
  filteredProducts = filteredProducts.slice(0, limit)
  
  // Generate NLP-based response
  const generatedResponse = ResponseGenerator.generateResponse(nlp.intent, filteredProducts)
  
  // Enhance response with specific details
  let enhancedResponse = responseText || generatedResponse.text
  
  if (filteredProducts.length > 0) {
    // Add price range information
    const prices = filteredProducts.map(p => p.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    if (minPrice !== maxPrice) {
      enhancedResponse += `\n\n💰 Price range: ₹${minPrice} - ₹${maxPrice}`
    }
    
    // Add rating information
    const avgRating = (filteredProducts.reduce((sum, p) => sum + p.rating, 0) / filteredProducts.length).toFixed(1)
    enhancedResponse += `\n⭐ Average rating: ${avgRating}/5`
    
    // Add brand variety
    const uniqueBrands = new Set(filteredProducts.map(p => p.brand))
    if (uniqueBrands.size > 1) {
      enhancedResponse += `\n🏷️ Brands: ${Array.from(uniqueBrands).join(', ')}`
    }
  }
  
  // Add conversational elements
  if (filteredProducts.length > 0) {
    enhancedResponse += `\n\n💭 Need help choosing? Feel free to ask me anything about these products!`
  } else {
    enhancedResponse += `\n\n💡 Try asking about a different category, brand, or price range. I'm here to help you find what you're looking for!`
  }
  
  return {
    response: enhancedResponse,
    relatedProducts: filteredProducts,
    action: nlp.action,
    nlpData: nlp
  }
}

async function filterProductsByIntent(intent: Intent, products: Product[]): Promise<Product[]> {
  let filteredProducts = [...products]
  
  // Category filter
  if (intent.entities.category) {
    const category = intent.entities.category
    filteredProducts = filteredProducts.filter(p => 
      p.category.toLowerCase().includes(category.toLowerCase())
    )
  }
  
  // Price range filter
  if (intent.entities.priceRange) {
    const { min, max } = intent.entities.priceRange
    filteredProducts = filteredProducts.filter(p => {
      if (min && max) {
        return p.price >= min && p.price <= max
      } else if (max) {
        return p.price <= max
      } else if (min) {
        return p.price >= min
      }
      return true
    })
  }
  
  // Brand filter
  if (intent.entities.brand) {
    const brand = intent.entities.brand
    filteredProducts = filteredProducts.filter(p => 
      p.brand.toLowerCase().includes(brand.toLowerCase())
    )
  }
  
  // Feature filter
  if (intent.entities.features) {
    filteredProducts = filteredProducts.filter(product => {
      return intent.entities.features!.some(feature => {
        const [type, value] = feature.split(':')
        if (!value) return false
        
        switch (type) {
          case 'color':
            return product.name.toLowerCase().includes(value.toLowerCase()) ||
                   product.description?.toLowerCase().includes(value.toLowerCase())
          case 'material':
            return product.description?.toLowerCase().includes(value.toLowerCase())
          default:
            return false
        }
      })
    })
  }
  
  return filteredProducts
}

// Export NLP functions for direct use if needed
export { IntentDetector, ResponseGenerator }