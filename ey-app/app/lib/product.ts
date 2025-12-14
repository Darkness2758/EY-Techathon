import { Product } from "../types/products"
import productsData from "../Collections/data/products.json"
import { IntentDetector, ResponseGenerator } from "./nlp"
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
  intent?: Intent
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
  
  // Apply filters based on NLP intent
  switch (nlp.intent.type) {
    case 'show_products':
    case 'show_recommendations':
    case 'price_query':
    case 'brand_query':
    case 'filter_query':
      filteredProducts = await filterProductsByIntent(nlp.intent, allProducts)
      break
      
    case 'show_categories':
      // For category listing, return all products but indicate it's a category query
      filteredProducts = allProducts
      break
      
    case 'comparison':
      // For comparison, return products that might be compared
      if (nlp.intent.entities.comparisonTargets) {
        const targets = nlp.intent.entities.comparisonTargets
        filteredProducts = allProducts.filter(p => 
          targets.some(target => 
            p.name.toLowerCase().includes(target.toLowerCase()) ||
            p.category.toLowerCase().includes(target.toLowerCase()) ||
            p.brand.toLowerCase().includes(target.toLowerCase())
          )
        )
      } else {
        // If no specific comparison targets, return top-rated products
        filteredProducts = await getRecommendations(4, nlp.intent)
      }
      break
      
    case 'general_help':
      // Return empty for help queries
      filteredProducts = []
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
  let enhancedResponse = generatedResponse.text
  
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
  
  // Add follow-up suggestions
  if (nlp.suggestions && nlp.suggestions.length > 0 && filteredProducts.length > 0) {
    enhancedResponse += `\n\n💡 You can also ask: "${nlp.suggestions[0]}"`
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

// Helper function for legacy compatibility
export async function generateLegacyAIResponse(userMessage: string): Promise<{
  response: string
  relatedProducts?: Product[]
  action?: 'show_products' | 'show_categories' | 'show_recommendations'
}> {
  const nlpResponse = IntentDetector.detectIntent(userMessage)
  const result = await generateAIResponse(userMessage, nlpResponse)
  
  // Convert to legacy format
  return {
    response: result.response,
    relatedProducts: result.relatedProducts,
    action: result.action as any // Type conversion for legacy compatibility
  }
}

// Export NLP functions for direct use if needed
export { IntentDetector, ResponseGenerator }