import { Product } from "../types/products"
import productsData from "../Collections/data/products.json"
import { ProductRanker } from "./ranking"

export interface SimilarityScore {
  product: Product
  score: number
  reasons: string[]
}

export class SimilarProductFinder {
  private static allProducts: Product[] = productsData as Product[]

  static async findSimilarProducts(
    referenceProduct: Product,
    limit: number = 5,
    excludeIds: number[] = []
  ): Promise<SimilarityScore[]> {
    const products = this.allProducts.filter(p => 
      p.id !== referenceProduct.id && 
      !excludeIds.includes(p.id)
    )

    const scoredProducts = products.map(product => {
      const { score, reasons } = this.calculateSimilarity(referenceProduct, product)
      return { product, score, reasons }
    })

    
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  static async findSimilarByFeatures(
    features: {
      category?: string
      brand?: string
      minPrice?: number
      maxPrice?: number
      minRating?: number
      styleKeywords?: string[]
    },
    limit: number = 5
  ): Promise<SimilarityScore[]> {
    const products = this.allProducts.map(product => {
      const { score, reasons } = this.calculateFeatureMatch(product, features)
      return { product, score, reasons }
    })

    
    return products
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  static async findComplementaryProducts(
    mainProduct: Product,
    limit: number = 3
  ): Promise<SimilarityScore[]> {
    
    const products = this.allProducts
      .filter(p => p.id !== mainProduct.id)
      .map(product => {
        const { score, reasons } = this.calculateComplementarity(mainProduct, product)
        return { product, score, reasons }
      })

    return products
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private static calculateSimilarity(productA: Product, productB: Product): {
    score: number
    reasons: string[]
  } {
    let score = 0
    const reasons: string[] = []

    
    if (productA.category === productB.category) {
      score += 40
      reasons.push(`Same category: ${productA.category}`)
    } else if (this.areCategoriesRelated(productA.category, productB.category)) {
      score += 20
      reasons.push(`Related categories: ${productA.category} → ${productB.category}`)
    }

    
    if (productA.brand === productB.brand) {
      score += 20
      reasons.push(`Same brand: ${productA.brand}`)
    }

    
    const priceDiff = Math.abs(productA.price - productB.price) / Math.max(productA.price, productB.price)
    if (priceDiff < 0.3) { 
      score += 15
      reasons.push(`Similar price range: ₹${productA.price} → ₹${productB.price}`)
    } else if (priceDiff < 0.5) {
      score += 7
    }

    
    const ratingDiff = Math.abs(productA.rating - productB.rating)
    if (ratingDiff < 0.5) {
      score += 10
      reasons.push(`Similar quality: ${productA.rating} → ${productB.rating} stars`)
    }

    
    const keywordMatch = this.calculateKeywordSimilarity(productA, productB)
    score += keywordMatch.score * 10
    if (keywordMatch.matchedKeywords.length > 0) {
      reasons.push(`Shared features: ${keywordMatch.matchedKeywords.slice(0, 3).join(', ')}`)
    }

    
    const styleMatch = this.calculateStyleSimilarity(productA, productB)
    score += styleMatch * 5
    if (styleMatch > 0.5) {
      reasons.push(`Similar style/design`)
    }

    
    score = Math.min(score, 100)

    return { score, reasons }
  }

  private static calculateFeatureMatch(
    product: Product,
    features: {
      category?: string
      brand?: string
      minPrice?: number
      maxPrice?: number
      minRating?: number
      styleKeywords?: string[]
    }
  ): {
    score: number
    reasons: string[]
  } {
    let score = 0
    const reasons: string[] = []

    
    if (features.category && product.category.toLowerCase().includes(features.category.toLowerCase())) {
      score += 30
      reasons.push(`Category: ${features.category}`)
    }

    
    if (features.brand && product.brand.toLowerCase().includes(features.brand.toLowerCase())) {
      score += 25
      reasons.push(`Brand: ${features.brand}`)
    }

    
    if (features.minPrice !== undefined && features.maxPrice !== undefined) {
      if (product.price >= features.minPrice && product.price <= features.maxPrice) {
        score += 25
        reasons.push(`Price: ₹${features.minPrice}-₹${features.maxPrice}`)
      }
    }

    
    if (features.minRating !== undefined && product.rating >= features.minRating) {
      score += 10
      reasons.push(`Rating: ${features.minRating}+ stars`)
    }

    
    if (features.styleKeywords && features.styleKeywords.length > 0) {
      const description = (product.description || '').toLowerCase()
      const matchedKeywords = features.styleKeywords.filter(keyword => 
        description.includes(keyword.toLowerCase())
      )
      if (matchedKeywords.length > 0) {
        score += 10 * matchedKeywords.length
        reasons.push(`Style: ${matchedKeywords.join(', ')}`)
      }
    }

    
    const popularity = ProductRanker.getPopularityScore(product.id)
    score += Math.min(popularity, 10) 

    return { score: Math.min(score, 100), reasons }
  }

  private static calculateComplementarity(productA: Product, productB: Product): {
    score: number
    reasons: string[]
  } {
    let score = 0
    const reasons: string[] = []

    
    if (productA.category !== productB.category) {
      score += 30
      reasons.push(`Complements your ${productA.category}`)
    }

    
    if (productB.category === 'Gloves' && productB.price < productA.price * 0.5) {
      score += 20
      reasons.push(`Affordable accessory`)
    }

    
    if (productA.brand === productB.brand) {
      score += 25
      reasons.push(`Matching ${productA.brand} brand`)
    }

    
    const styleMatch = this.calculateStyleSimilarity(productA, productB)
    if (styleMatch > 0.6) {
      score += 25
      reasons.push(`Coordinated style`)
    }

    return { score: Math.min(score, 100), reasons }
  }

  private static areCategoriesRelated(categoryA: string, categoryB: string): boolean {
    const relatedGroups = [
      ['Jacket', 'Hoodie'], 
      ['Pants', 'Gloves'], 
    ]
    
    return relatedGroups.some(group => 
      group.includes(categoryA) && group.includes(categoryB)
    )
  }

  private static calculateKeywordSimilarity(productA: Product, productB: Product): {
    score: number
    matchedKeywords: string[]
  } {
    const descA = (productA.description || '').toLowerCase()
    const descB = (productB.description || '').toLowerCase()
    
    
    const keywordsA = this.extractKeywords(descA)
    const keywordsB = this.extractKeywords(descB)
    
    
    const matchedKeywords = keywordsA.filter(keyword => 
      keywordsB.includes(keyword) && keyword.length > 4
    )
    
    
    const maxPossible = Math.max(keywordsA.length, keywordsB.length)
    const score = maxPossible > 0 ? matchedKeywords.length / maxPossible : 0
    
    return { score, matchedKeywords }
  }

  private static calculateStyleSimilarity(productA: Product, productB: Product): number {
    const styleWords = [
      'casual', 'formal', 'sporty', 'streetwear', 'elegant', 'minimalist',
      'edgy', 'classic', 'modern', 'vintage', 'trendy', 'bold', 'subtle',
      'comfortable', 'premium', 'luxury', 'affordable', 'statement'
    ]
    
    const descA = (productA.description || '').toLowerCase()
    const descB = (productB.description || '').toLowerCase()
    
    const stylesA = styleWords.filter(word => descA.includes(word))
    const stylesB = styleWords.filter(word => descB.includes(word))
    
    if (stylesA.length === 0 && stylesB.length === 0) return 0
    
    const commonStyles = stylesA.filter(style => stylesB.includes(style))
    const totalStyles = new Set([...stylesA, ...stylesB]).size
    
    return totalStyles > 0 ? commonStyles.length / totalStyles : 0
  }

  private static extractKeywords(text: string): string[] {
    
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
      'should', 'can', 'could', 'may', 'might', 'must'
    ])
    
    return text
      .split(/[^\w]+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word.toLowerCase()) &&
        !/^\d+$/.test(word)
      )
      .map(word => word.toLowerCase())
  }

  static async getSimilarityExplanation(
    referenceProduct: Product,
    similarProduct: Product
  ): Promise<string> {
    const similarity = this.calculateSimilarity(referenceProduct, similarProduct)
    
    if (similarity.score >= 80) {
      return `Very similar to ${referenceProduct.name}! They share ${similarity.reasons.slice(0, 2).join(' and ')}.`
    } else if (similarity.score >= 60) {
      return `Quite similar to ${referenceProduct.name}. ${similarity.reasons[0] || 'They have comparable features.'}`
    } else if (similarity.score >= 40) {
      return `Somewhat similar to ${referenceProduct.name}. ${similarity.reasons[0] || 'Consider this alternative.'}`
    } else {
      return `Alternative option to ${referenceProduct.name}. Different but worth considering.`
    }
  }

  static async findSimilarByUserBehavior(
    userId: string,
    viewedProducts: number[],
    limit: number = 5
  ): Promise<SimilarityScore[]> {
    
    
    if (viewedProducts.length === 0) {
      return []
    }
    
    
    const recentProductId = viewedProducts[viewedProducts.length - 1]
    const recentProduct = this.allProducts.find(p => p.id === recentProductId)
    
    if (!recentProduct) {
      return []
    }
    
    
    return this.findSimilarProducts(recentProduct, limit, viewedProducts)
  }
}