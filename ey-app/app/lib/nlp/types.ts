export interface Intent {
  type: 'show_products' | 'show_categories' | 'show_recommendations' | 'price_query' | 'brand_query' | 'filter_query' | 'comparison' | 'general_help'
  confidence: number
  entities: {
    category?: string
    brand?: string
    priceRange?: { min?: number; max?: number }
    productType?: string
    features?: string[]
    comparisonTargets?: string[]
  }
  parameters: {
    limit?: number
    sortBy?: 'price' | 'rating' | 'name'
    sortOrder?: 'asc' | 'desc'
  }
}

export interface NLPResponse {
  intent: Intent
  normalizedQuery: string
  action: Intent['type']
  suggestions?: string[]
}

export interface QueryContext {
  previousIntent?: Intent
  conversationHistory: string[]
  userPreferences?: {
    preferredCategories?: string[]
    priceRange?: { min: number; max: number }
    favoriteBrands?: string[]
  }
}