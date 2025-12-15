import { Intent } from './types'
import { Product } from '../../types/products'

/**
 * This class is intentionally opinionated.
 * If inputs are weak or inconsistent, the response will say so instead of hand-waving.
 */
export class ResponseGenerator {
  static generateResponse(
    intent: Intent,
    products: Product[] = []
  ): { text: string; suggestions?: string[] } {
    if (!intent || !intent.type) {
      return {
        text: 'Your request was unclear. Be specific about category, price, brand, or intent.'
      }
    }

    let text = ''
    let suggestions: string[] = []

    switch (intent.type) {
      case 'show_products':
        text = this.generateProductResponse(intent, products)
        suggestions = this.contextualSuggestions(intent, products)
        break

      case 'show_categories':
        text =
          'You can browse by category. Available: Jackets, Hoodies, Pants, Accessories.'
        suggestions = ['Show jackets', 'Show hoodies', 'Show everything']
        break

      case 'show_recommendations':
        text = this.generateRecommendationResponse(intent, products)
        suggestions = ['Best sellers', 'Trending now', 'Under ₹1000']
        break

      case 'price_query':
        text = this.generatePriceResponse(intent, products)
        suggestions = ['Cheaper options', 'Premium picks', 'Compare prices']
        break

      case 'brand_query':
        text = intent.entities.brand
          ? `Showing results from ${intent.entities.brand}.`
          : 'You asked about brands, but didn’t specify one.'
        break

      case 'general_help':
      default:
        text =
          'I help you find products efficiently. Categories, prices, brands, comparisons, recommendations. Ask clearly.'
        suggestions = ['Jackets under ₹2000', 'Top rated hoodies', 'Trending products']
        break
    }

    return {
      text,
      suggestions: suggestions.length ? suggestions.slice(0, 4) : undefined
    }
  }

  // -------------------------
  // Core Generators
  // -------------------------

  private static generateProductResponse(
    intent: Intent,
    products: Product[]
  ): string {
    const { category, priceRange, brand } = intent.entities
    const { limit = 5 } = intent.parameters

    if (products.length === 0) {
      return 'No products matched your filters. Loosen your constraints or change category.'
    }

    let summary = `Found ${products.length} product${products.length > 1 ? 's' : ''}`

    if (category) summary += ` in ${category}`
    if (brand) summary += ` by ${brand}`

    if (priceRange) {
      if (priceRange.min && priceRange.max) {
        summary += ` between ₹${priceRange.min}–₹${priceRange.max}`
      } else if (priceRange.max) {
        summary += ` under ₹${priceRange.max}`
      } else if (priceRange.min) {
        summary += ` above ₹${priceRange.min}`
      }
    }

    const items = products
      .slice(0, limit)
      .map(p => `${p.name} — ₹${p.price}`)
      .join(', ')

    return `${summary}. Top results: ${items}.`
  }

  private static generateRecommendationResponse(
    intent: Intent,
    products: Product[]
  ): string {
    if (products.length === 0) {
      return 'No data to recommend anything meaningful. Browse first.'
    }

    const { sortBy = 'rating', sortOrder = 'desc', limit = 3 } = intent.parameters

    const ranked = [...products].sort((a, b) => {
      const dir = sortOrder === 'desc' ? -1 : 1
      if (sortBy === 'price') return (a.price - b.price) * dir
      return (a.rating - b.rating) * dir
    })

    const top = ranked.slice(0, limit)

    return (
      `Top ${top.length} recommendations based on ${sortBy}:` +
      top
        .map(
          (p, i) =>
            `\n${i + 1}. ${p.name} | ₹${p.price} | ⭐ ${p.rating}$${
              p.brand ? ' | ' + p.brand : ''
            }`
        )
        .join('') +
      '\n\nSay the product name if you want details.'
    )
  }

  private static generatePriceResponse(
    intent: Intent,
    products: Product[]
  ): string {
    if (!intent.entities.priceRange) {
      return 'You asked about price, but gave no range.'
    }

    if (products.length === 0) {
      return 'Nothing exists in that price range.'
    }

    const prices = products.map(p => p.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)

    return `Prices range from ₹${min} to ₹${max}. Average: ₹${avg}. Total products: ${products.length}.`
  }

  // -------------------------
  // Suggestions Logic
  // -------------------------

  private static contextualSuggestions(
    intent: Intent,
    products: Product[]
  ): string[] {
    const suggestions: string[] = []

    if (intent.entities.category) {
      suggestions.push(`More ${intent.entities.category}`)
    }

    if (intent.entities.priceRange) {
      suggestions.push('Same price, better rated')
      suggestions.push('Cheaper alternatives')
    }

    if (products.length > 5) {
      suggestions.push('Show more results')
    }

    suggestions.push('Sort by price')
    suggestions.push('Sort by rating')

    return suggestions
  }
}
