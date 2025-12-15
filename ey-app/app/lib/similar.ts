import { Product } from '../types/products'
import productsData from '../Collections/data/products.json'
import { ProductRanker } from './ranking'

export interface SimilarityScore {
  product: Product
  score: number
  reasons: string[]
  confidence: number
}


export class SimilarProductFinder {
  private static readonly allProducts: Product[] = productsData as Product[]

  static findSimilarProducts(
    reference: Product,
    limit = 5,
    excludeIds: number[] = []
  ): SimilarityScore[] {
    return this.rankProducts(
      this.allProducts.filter(p => p.id !== reference.id && !excludeIds.includes(p.id)),
      p => this.similarityScore(reference, p),
      limit
    )
  }

  static findByFeatures(
    features: {
      category?: string
      brand?: string
      minPrice?: number
      maxPrice?: number
      minRating?: number
      styleKeywords?: string[]
    },
    limit = 5
  ): SimilarityScore[] {
    return this.rankProducts(
      this.allProducts,
      p => this.featureScore(p, features),
      limit
    )
  }

  static findComplementaryProducts(
    base: Product,
    limit = 3
  ): SimilarityScore[] {
    return this.rankProducts(
      this.allProducts.filter(p => p.id !== base.id),
      p => this.complementScore(base, p),
      limit
    )
  }

  static findFromUserBehavior(
    viewedProductIds: number[],
    limit = 5
  ): SimilarityScore[] {
    if (viewedProductIds.length === 0) return []

    const anchor = this.allProducts.find(
      p => p.id === viewedProductIds[viewedProductIds.length - 1]
    )

    if (!anchor) return []

    return this.findSimilarProducts(anchor, limit, viewedProductIds)
  }

  
  
  

  private static rankProducts(
    products: Product[],
    scorer: (p: Product) => Omit<SimilarityScore, 'product'>,
    limit: number
  ): SimilarityScore[] {
    return products
      .map(p => ({ product: p, ...scorer(p) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  
  
  

  private static similarityScore(a: Product, b: Product) {
    let score = 0
    const reasons: string[] = []

    
    if (a.category === b.category) {
      score += 35
      reasons.push(`Same category (${a.category})`)
    } else if (this.relatedCategory(a.category, b.category)) {
      score += 20
      reasons.push('Related category')
    }

    
    if (a.brand && a.brand === b.brand) {
      score += 20
      reasons.push(`Same brand (${a.brand})`)
    }

    
    const priceDelta = Math.abs(a.price - b.price) / Math.max(a.price, b.price)
    if (priceDelta < 0.25) {
      score += 15
      reasons.push('Similar price')
    } else if (priceDelta < 0.5) {
      score += 7
    }

    
    if (Math.abs(a.rating - b.rating) < 0.5) {
      score += 10
      reasons.push('Comparable quality')
    }

    
    const textSim = this.keywordSimilarity(a.description, b.description)
    if (textSim.value > 0) {
      score += textSim.value * 10
      reasons.push(`Shared features: ${textSim.keywords.slice(0, 3).join(', ')}`)
    }

    
    score += Math.min(ProductRanker.getPopularityScore(b.id), 10)

    const finalScore = Math.min(100, Math.round(score))

    return {
      score: finalScore,
      reasons,
      confidence: finalScore / 100
    }
  }

  
  
  

  private static featureScore(
    product: Product,
    f: {
      category?: string
      brand?: string
      minPrice?: number
      maxPrice?: number
      minRating?: number
      styleKeywords?: string[]
    }
  ) {
    let score = 0
    const reasons: string[] = []

    if (f.category && product.category.toLowerCase().includes(f.category.toLowerCase())) {
      score += 30
      reasons.push('Category match')
    }

    if (f.brand && product.brand?.toLowerCase().includes(f.brand.toLowerCase())) {
      score += 25
      reasons.push('Brand match')
    }

    if (f.minPrice !== undefined && f.maxPrice !== undefined) {
      if (product.price >= f.minPrice && product.price <= f.maxPrice) {
        score += 25
        reasons.push('Price match')
      }
    }

    if (f.minRating !== undefined && product.rating >= f.minRating) {
      score += 10
      reasons.push('Rating match')
    }

    if (f.styleKeywords?.length) {
      const matches = this.matchKeywords(product.description, f.styleKeywords)
      if (matches.length) {
        score += Math.min(matches.length * 8, 20)
        reasons.push(`Style: ${matches.join(', ')}`)
      }
    }

    score += Math.min(ProductRanker.getPopularityScore(product.id), 10)

    return {
      score: Math.min(100, score),
      reasons,
      confidence: score / 100
    }
  }

  
  
  

  private static complementScore(a: Product, b: Product) {
    let score = 0
    const reasons: string[] = []

    if (a.category !== b.category) {
      score += 30
      reasons.push('Complements main product')
    }

    if (a.brand && a.brand === b.brand) {
      score += 25
      reasons.push('Brand consistency')
    }

    if (b.price < a.price * 0.6) {
      score += 15
      reasons.push('Affordable add-on')
    }

    const style = this.styleSimilarity(a.description, b.description)
    if (style > 0.6) {
      score += 20
      reasons.push('Style compatible')
    }

    return {
      score: Math.min(100, score),
      reasons,
      confidence: score / 100
    }
  }

  
  
  

  private static relatedCategory(a: string, b: string): boolean {
    const groups = [
      ['Jacket', 'Hoodie'],
      ['Pants', 'Shorts'],
      ['Shoes', 'Socks']
    ]

    return groups.some(g => g.includes(a) && g.includes(b))
  }

  private static keywordSimilarity(a?: string, b?: string) {
    if (!a || !b) return { value: 0, keywords: [] as string[] }

    const ka = new Set(this.extractKeywords(a))
    const kb = new Set(this.extractKeywords(b))

    const matches = [...ka].filter(k => kb.has(k))
    const max = Math.max(ka.size, kb.size)

    return {
      value: max ? matches.length / max : 0,
      keywords: matches
    }
  }

  private static styleSimilarity(a?: string, b?: string): number {
    if (!a || !b) return 0

    const styles = ['casual', 'formal', 'sporty', 'streetwear', 'minimal', 'luxury']

    const sa = styles.filter(s => a.toLowerCase().includes(s))
    const sb = styles.filter(s => b.toLowerCase().includes(s))

    const common = sa.filter(s => sb.includes(s))
    const total = new Set([...sa, ...sb]).size

    return total ? common.length / total : 0
  }

  private static matchKeywords(text = '', keys: string[]) {
    const lower = text.toLowerCase()
    return keys.filter(k => lower.includes(k.toLowerCase()))
  }

  private static extractKeywords(text: string): string[] {
    const stop = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this'])

    return text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(w => w.length > 3 && !stop.has(w))
  }
}
