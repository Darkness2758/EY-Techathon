import { Intent } from './types'
import { Product } from '../../types/products'

export class ResponseGenerator {
  static generateResponse(intent: Intent, products: Product[] = []): {
    text: string
    suggestions?: string[]
  } {
    let baseResponse = ''
    let suggestions: string[] = []

    switch (intent.type) {
      case 'show_products':
        baseResponse = this.generateProductResponse(intent, products)
        suggestions = [
          'Show me more options',
          'Filter by price',
          'Sort by rating'
        ]
        break
        
      case 'show_categories':
        baseResponse = `I can help you browse products by category. We have jackets, hoodies, pants, and accessories available. What category interests you?`
        suggestions = ['Show me jackets', 'Show me hoodies', 'Show all categories']
        break
        
      case 'show_recommendations':
        baseResponse = this.generateRecommendationResponse(intent, products)
        suggestions = [
          'Show me best sellers',
          'What\'s trending?',
          'Recommend based on price'
        ]
        break
        
      case 'price_query':
        baseResponse = this.generatePriceResponse(intent, products)
        suggestions = [
          'Show cheaper options',
          'Show premium options',
          'Compare prices'
        ]
        break
        
      case 'brand_query':
        baseResponse = `I found products from ${intent.entities.brand || 'various brands'}.`
        break
        
      case 'general_help':
        baseResponse = `I'm your fashion assistant! I can help you:
• Find products by category, brand, or price
• Show recommendations
• Compare products
• Filter and sort products
What would you like to do?`
        suggestions = [
          'Show me jackets',
          'Products under ₹300',
          'Recommendations',
          'Wink brand products'
        ]
        break
    }

    // Add contextual suggestions
    if (intent.entities.category) {
      suggestions.unshift(`More ${intent.entities.category}`)
    }
    
    if (intent.entities.priceRange) {
      suggestions.unshift('Similar price range')
    }

    return {
      text: baseResponse,
      suggestions: suggestions.slice(0, 4)
    }
  }

  private static generateProductResponse(intent: Intent, products: Product[]): string {
    const { category, priceRange, brand } = intent.entities
    const { limit = 5 } = intent.parameters
    
    let response = 'Here'
    
    if (category) {
      response += ` are ${products.length} ${category}`
    } else {
      response += ` are ${products.length} products`
    }
    
    if (brand) {
      response += ` from ${brand}`
    }
    
    if (priceRange) {
      if (priceRange.min && priceRange.max) {
        response += ` between ₹${priceRange.min} and ₹${priceRange.max}`
      } else if (priceRange.max) {
        response += ` under ₹${priceRange.max}`
      } else if (priceRange.min) {
        response += ` above ₹${priceRange.min}`
      }
    }
    
    response += `. `
    
    if (products.length > 0) {
      const topProducts = products.slice(0, limit)
      const productList = topProducts.map(p => `${p.name} (₹${p.price})`).join(', ')
      response += `Top picks: ${productList}.`
    } else {
      response += `I couldn't find products matching your criteria. Try adjusting your filters.`
    }
    
    return response
  }

  private static generateRecommendationResponse(intent: Intent, products: Product[]): string {
    const { sortBy = 'rating', sortOrder = 'desc', limit = 3 } = intent.parameters
    
    // Sort products based on parameters
    const sortedProducts = [...products].sort((a, b) => {
      if (sortBy === 'rating') {
        return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating
      } else if (sortBy === 'price') {
        return sortOrder === 'desc' ? b.price - a.price : a.price - b.price
      }
      return 0
    })
    
    const topProducts = sortedProducts.slice(0, limit)
    
    if (topProducts.length === 0) {
      return "I don't have enough data to provide recommendations yet. Try browsing some products first!"
    }
    
    let response = `Based on ${sortBy === 'rating' ? 'customer ratings' : 'price'}, here are my top recommendations:\n`
    
    topProducts.forEach((product, index) => {
      response += `\n${index + 1}. **${product.name}** - ₹${product.price} (⭐ ${product.rating}/5)`
      if (product.brand) {
        response += ` - ${product.brand}`
      }
    })
    
    response += `\n\nWould you like more details on any of these?`
    
    return response
  }

  private static generatePriceResponse(intent: Intent, products: Product[]): string {
    const { priceRange } = intent.entities
    
    if (!priceRange || products.length === 0) {
      return "I need more information about the price range you're looking for."
    }
    
    const prices = products.map(p => p.price)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    return `Products in this category range from ₹${minPrice} to ₹${maxPrice}, with an average price of ₹${Math.round(avgPrice)}. I found ${products.length} products matching your criteria.`
  }
}