import { Intent, NLPResponse, QueryContext } from './types'
import { 
  CATEGORY_PATTERNS, 
  BRAND_PATTERNS, 
  PRICE_PATTERNS, 
  INTENT_PATTERNS,
  FEATURE_PATTERNS 
} from './patterns'
import { TextTokenizer } from './tokenizer'

export class IntentDetector {
  static detectIntent(text: string, context?: QueryContext): NLPResponse {
    const normalizedQuery = TextTokenizer.normalizeText(text)
    const tokens = TextTokenizer.tokenize(normalizedQuery)
    const keywords = TextTokenizer.extractKeywords(tokens)
    
    const intent = this.analyzeText(normalizedQuery, tokens, keywords, context)
    
    return {
      intent,
      normalizedQuery,
      action: intent.type,
      suggestions: this.generateSuggestions(intent)
    }
  }

  private static analyzeText(
    text: string, 
    tokens: string[], 
    keywords: string[],
    context?: QueryContext
  ): Intent {
    const intent: Intent = {
      type: 'general_help',
      confidence: 0.7,
      entities: {},
      parameters: {}
    }

    // Detect primary intent
    let detectedIntent: Intent['type'] = 'general_help'
    let confidence = 0.7

    if (INTENT_PATTERNS.showProducts.test(text)) {
      detectedIntent = 'show_products'
      confidence = 0.9
    }
    
    if (INTENT_PATTERNS.recommendations.test(text)) {
      detectedIntent = 'show_recommendations'
      confidence = Math.max(confidence, 0.85)
    }
    
    if (INTENT_PATTERNS.comparison.test(text)) {
      detectedIntent = 'comparison'
      confidence = 0.8
    }
    
    if (INTENT_PATTERNS.categories.test(text)) {
      detectedIntent = 'show_categories'
      confidence = 0.9
    }

    // Detect entities
    const entities: Intent['entities'] = {}
    
    // Category detection
    for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
      if (pattern.test(text) && category !== 'all') {
        entities.category = category
        confidence += 0.1
        break
      }
    }

    // Brand detection
    for (const [brand, pattern] of Object.entries(BRAND_PATTERNS)) {
      if (pattern.test(text)) {
        entities.brand = brand
        confidence += 0.05
      }
    }

    // Price range detection
    const priceRange = this.extractPriceRange(text)
    if (priceRange) {
      entities.priceRange = priceRange
      confidence += 0.15
    }

    // Feature detection
    const features: string[] = []
    for (const [featureType, pattern] of Object.entries(FEATURE_PATTERNS)) {
      const match = text.match(pattern)
      if (match) {
        features.push(`${featureType}:${match[0]}`)
      }
    }
    if (features.length > 0) {
      entities.features = features
      confidence += 0.05 * features.length
    }

    // Extract parameters
    const parameters: Intent['parameters'] = {}
    const numbers = TextTokenizer.extractNumbers(text)
    
    if (text.includes('top') || text.includes('best')) {
      const topMatch = text.match(/top\s+(\d+)/i) || text.match(/best\s+(\d+)/i)
      parameters.limit = topMatch ? parseInt(topMatch[1]) : 5
    }

    if (text.includes('cheap') || text.includes('lowest')) {
      parameters.sortBy = 'price'
      parameters.sortOrder = 'asc'
    } else if (text.includes('expensive') || text.includes('highest')) {
      parameters.sortBy = 'price'
      parameters.sortOrder = 'desc'
    } else if (text.includes('rating')) {
      parameters.sortBy = 'rating'
      parameters.sortOrder = 'desc'
    }

    // Apply context from conversation history
    if (context?.previousIntent) {
      // Carry over entities from previous intent if relevant
      if (detectedIntent === 'show_products' && context.previousIntent.entities.category) {
        entities.category = context.previousIntent.entities.category
      }
      
      // Increase confidence for follow-up questions
      if (context.conversationHistory.length > 0) {
        confidence = Math.min(confidence + 0.1, 1.0)
      }
    }

    return {
      type: detectedIntent,
      confidence: Math.min(confidence, 1.0),
      entities,
      parameters
    }
  }

  private static extractPriceRange(text: string): { min?: number; max?: number } | null {
    const priceRange: { min?: number; max?: number } = {}
    
    // Check for "under" patterns
    const underMatch = text.match(PRICE_PATTERNS.under)
    if (underMatch) {
      priceRange.max = parseInt(underMatch[2])
      return priceRange
    }

    // Check for "above" patterns
    const aboveMatch = text.match(PRICE_PATTERNS.above)
    if (aboveMatch) {
      priceRange.min = parseInt(aboveMatch[2])
      return priceRange
    }

    // Check for "between" patterns
    const betweenMatch = text.match(PRICE_PATTERNS.between)
    if (betweenMatch) {
      priceRange.min = parseInt(betweenMatch[2])
      priceRange.max = parseInt(betweenMatch[3])
      return priceRange
    }

    // Check for exact price
    const exactMatch = text.match(PRICE_PATTERNS.exact)
    if (exactMatch) {
      const price = parseInt(exactMatch[2])
      priceRange.min = price
      priceRange.max = price
      return priceRange
    }

    // Look for simple number patterns with price context
    if (text.includes('₹') || text.includes('$') || text.includes('rupee') || text.includes('price')) {
      const numbers = TextTokenizer.extractNumbers(text)
      if (numbers.length === 1) {
        priceRange.max = numbers[0]
        return priceRange
      } else if (numbers.length === 2) {
        priceRange.min = Math.min(numbers[0], numbers[1])
        priceRange.max = Math.max(numbers[0], numbers[1])
        return priceRange
      }
    }

    return null
  }

  private static generateSuggestions(intent: Intent): string[] {
    const suggestions: string[] = []
    
    switch (intent.type) {
      case 'show_products':
        if (intent.entities.category) {
          suggestions.push(`Show me more ${intent.entities.category}`)
          suggestions.push(`What are the best ${intent.entities.category}?`)
        }
        if (intent.entities.priceRange) {
          suggestions.push(`Show me products under ₹${intent.entities.priceRange.max}`)
        }
        break
        
      case 'show_recommendations':
        suggestions.push('Show me trending products')
        suggestions.push('What are the best sellers?')
        suggestions.push('Recommend based on my previous interests')
        break
        
      case 'price_query':
        suggestions.push('Show me cheaper alternatives')
        suggestions.push('What is the price range for this category?')
        break
    }
    
    return suggestions.slice(0, 3)
  }
}