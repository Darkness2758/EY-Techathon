import { Product } from "../types/products"
import type { QueryContext, Intent } from "./nlp/types"

export interface RankingWeights {
  category: number
  brand: number
  price: number
  rating: number
  popularity: number
  relevance: number
  recency: number 
  seasonality: number 
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  category: 2.0,
  brand: 1.5,
  price: 1.2,
  rating: 1.8,
  popularity: 1.3,
  relevance: 2.5,
  recency: 0.8,
  seasonality: 1.0
}

export interface RankingOptions {
  weights?: Partial<RankingWeights>
  maxResults?: number
  boostNewProducts?: boolean
  considerSeasonality?: boolean
  excludeOutOfStock?: boolean
  minRating?: number
  maxPrice?: number
}


interface SeasonalMultipliers {
  [category: string]: number
}

export class ProductRanker {
  private static popularityScores: Map<number, number> = new Map()
  
  
  private static seasonalMultipliers: Map<string, SeasonalMultipliers> = new Map([
    ['Winter', { 'Jacket': 1.8, 'Gloves': 1.6, 'Hoodie': 1.4, 'Pants': 1.2 }],
    ['Summer', { 'Jacket': 0.6, 'Gloves': 0.4, 'Hoodie': 0.7, 'Pants': 1.4 }],
    ['Spring', { 'Jacket': 1.2, 'Gloves': 0.8, 'Hoodie': 1.3, 'Pants': 1.5 }],
    ['Autumn', { 'Jacket': 1.5, 'Gloves': 1.2, 'Hoodie': 1.6, 'Pants': 1.3 }]
  ])

  static trackPopularity(productId: number, action: 'view' | 'click' | 'purchase' = 'view') {
    const currentScore = this.popularityScores.get(productId) || 0
    const increment = action === 'purchase' ? 3 : action === 'click' ? 2 : 1
    this.popularityScores.set(productId, currentScore + increment)
  }

  static getPopularityScore(productId: number): number {
    return this.popularityScores.get(productId) || 0
  }

  static getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 11 || month <= 1) return 'Winter'
    if (month >= 2 && month <= 4) return 'Spring'
    if (month >= 5 && month <= 7) return 'Summer'
    return 'Autumn'
  }

  static getSeasonalMultiplier(category: string): number {
    const season = this.getCurrentSeason()
    const multipliers = this.seasonalMultipliers.get(season)
    return multipliers?.[category] || 1.0
  }

  static calculateRelevanceScore(
    product: Product,
    query: string,
    intent?: Intent
  ): number {
    let score = 0
    const queryLower = query.toLowerCase()
    const productNameLower = product.name.toLowerCase()
    const categoryLower = product.category.toLowerCase()
    const brandLower = product.brand.toLowerCase()
    const descriptionLower = product.description?.toLowerCase() || ''

    
    if (productNameLower.includes(queryLower)) score += 3
    if (brandLower.includes(queryLower)) score += 2
    if (categoryLower.includes(queryLower)) score += 1.5
    if (descriptionLower.includes(queryLower)) score += 1

    
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)
    queryWords.forEach(word => {
      if (productNameLower.includes(word)) score += 0.5
      if (brandLower.includes(word)) score += 0.3
      if (categoryLower.includes(word)) score += 0.2
      if (descriptionLower.includes(word)) score += 0.1
    })

    
    if (intent?.entities?.category && categoryLower.includes(intent.entities.category.toLowerCase())) {
      score += 2
    }
    
    if (intent?.entities?.brand && brandLower.includes(intent.entities.brand.toLowerCase())) {
      score += 1.5
    }

    
    if (intent?.entities?.priceRange) {
      const { min, max } = intent.entities.priceRange
      const inRange = (!min || product.price >= min) && (!max || product.price <= max)
      if (inRange) score += 1.5
    }

    return Math.min(score, 5) 
  }

  static rankProducts(
    products: Product[],
    context: QueryContext,
    currentQuery?: string,
    currentIntent?: Intent,
    options: RankingOptions = {}
  ): Product[] {
    const weights = { ...DEFAULT_WEIGHTS, ...options.weights }
    
    const scoredProducts = products.map(product => {
      const score = this.calculateProductScore(
        product, 
        context, 
        weights, 
        options,
        currentQuery,
        currentIntent
      )
      return { product, score }
    })

    
    scoredProducts.sort((a, b) => b.score - a.score)

    
    let filtered = scoredProducts
    if (options.minRating !== undefined) {
      filtered = filtered.filter(({ product }) => product.rating >= options.minRating!)
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(({ product }) => product.price <= options.maxPrice!)
    }

    
    const result = filtered.map(({ product }) => product)
    return options.maxResults ? result.slice(0, options.maxResults) : result
  }

  private static calculateProductScore(
    product: Product,
    context: QueryContext,
    weights: RankingWeights,
    options: RankingOptions,
    currentQuery?: string,
    currentIntent?: Intent
  ): number {
    let score = 0

    
    const hasCategoryPreference = context.userPreferences?.preferredCategories?.length > 0
    if (hasCategoryPreference) {
      const categoryMatch = context.userPreferences.preferredCategories.includes(product.category)
      score += categoryMatch ? weights.category : 0
    }

    
    const hasBrandPreference = context.userPreferences?.favoriteBrands?.length > 0
    if (hasBrandPreference) {
      const brandMatch = context.userPreferences.favoriteBrands.includes(product.brand)
      score += brandMatch ? weights.brand : 0
    }

    
    const { min, max } = context.userPreferences?.priceRange || { min: 0, max: Infinity }
    const priceFit = product.price >= min && product.price <= max
    score += priceFit ? weights.price : 0

    
    const priceRange = max - min
    if (priceRange > 0) {
      const normalizedPrice = (product.price - min) / priceRange
      
      const pricePreferenceScore = 1 - Math.abs(normalizedPrice - 0.5) * 2
      score += pricePreferenceScore * weights.price * 0.5
    }

    
    score += product.rating * weights.rating

    
    const popularity = this.getPopularityScore(product.id)
    score += (popularity / 10) * weights.popularity 

    
    if (currentQuery && currentIntent) {
      const relevance = this.calculateRelevanceScore(
        product,
        currentQuery,
        currentIntent
      )
      score += relevance * weights.relevance
    }

    
    if (options.boostNewProducts) {
      
      const recencyBoost = (product.id / 1000) * weights.recency
      score += recencyBoost
    }

    
    if (options.considerSeasonality) {
      const seasonalMultiplier = this.getSeasonalMultiplier(product.category)
      score *= seasonalMultiplier
    }

    
    const userHistory = context.conversationHistory || []
    const brandMentioned = userHistory.some(query => 
      query.toLowerCase().includes(product.brand.toLowerCase())
    )
    if (brandMentioned) score += 0.5 * weights.brand

    const categoryMentioned = userHistory.some(query => 
      query.toLowerCase().includes(product.category.toLowerCase())
    )
    if (categoryMentioned) score += 0.5 * weights.category

    return score
  }

  static rankByPriceSensitivity(products: Product[], userBudget: number): Product[] {
    return [...products].sort((a, b) => {
      
      const valueA = a.rating / (a.price || 1)
      const valueB = b.rating / (b.price || 1)

      
      const budgetProxA = 1 - Math.abs(a.price - userBudget) / (userBudget || 1)
      const budgetProxB = 1 - Math.abs(b.price - userBudget) / (userBudget || 1)

      const scoreA = valueA * 0.7 + budgetProxA * 0.3
      const scoreB = valueB * 0.7 + budgetProxB * 0.3

      return scoreB - scoreA
    })
  }

  static rankForComparison(products: Product[], criteria: string[]): Product[] {
    return [...products].sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      criteria.forEach(criterion => {
        const criterionLower = criterion.toLowerCase()
        
        if (criterionLower.includes('price') || criterionLower.includes('cheap')) {
          scoreA += 1 / (a.price || 1)
          scoreB += 1 / (b.price || 1)
        }
        
        if (criterionLower.includes('rating') || criterionLower.includes('quality')) {
          scoreA += a.rating
          scoreB += b.rating
        }
        
        if (criterionLower.includes('popular') || criterionLower.includes('trend')) {
          scoreA += this.getPopularityScore(a.id)
          scoreB += this.getPopularityScore(b.id)
        }
        
        if (criterionLower.includes('new') || criterionLower.includes('latest')) {
          scoreA += a.id 
          scoreB += b.id
        }
      })

      return scoreB - scoreA
    })
  }

  static getSimilarProducts(
    referenceProduct: Product,
    allProducts: Product[],
    limit: number = 5
  ): Product[] {
    return allProducts
      .filter(p => p.id !== referenceProduct.id)
      .map(product => {
        let similarity = 0
        
        
        if (product.category === referenceProduct.category) similarity += 3
        
        
        if (product.brand === referenceProduct.brand) similarity += 2
        
        
        const priceDiff = Math.abs(product.price - referenceProduct.price) / referenceProduct.price
        if (priceDiff <= 0.2) similarity += 1.5
        
        
        const ratingDiff = Math.abs(product.rating - referenceProduct.rating)
        if (ratingDiff <= 0.5) similarity += 1
        
        
        const descA = referenceProduct.description?.toLowerCase() || ''
        const descB = product.description?.toLowerCase() || ''
        const keywordsA = descA.split(/\s+/).filter(w => w.length > 3)
        const matchingKeywords = keywordsA.filter(word => descB.includes(word)).length
        similarity += matchingKeywords * 0.3
        
        return { product, similarity }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ product }) => product)
  }

  static calculateProductValue(product: Product): number {
    
    const popularity = this.getPopularityScore(product.id) + 1 
    return (product.rating * popularity) / (product.price || 1)
  }

  static getBestValueProducts(products: Product[], limit: number = 5): Product[] {
    return [...products]
      .map(product => ({
        product,
        value: this.calculateProductValue(product)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
      .map(({ product }) => product)
  }
}


declare module "./nlp/types" {
  interface QueryContext {
    currentQuery?: string
    currentIntent?: Intent
  }
}


export function rankProducts(
  products: Product[],
  context: QueryContext,
  currentQuery?: string,
  currentIntent?: Intent
): Product[] {
  return ProductRanker.rankProducts(products, context, currentQuery, currentIntent)
}