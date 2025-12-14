import { Product } from "../../types/products"
import type { NLPResponse } from "./types"
import { SimilarProductFinder } from "../similar"
import { ProductRanker } from "../ranking"

export interface AboutResponse {
  text: string
  type: 'company' | 'products' | 'mission' | 'contact' | 'help' | 'features' | 'product' | 'brand' | 'category'
  suggestions?: string[]
  relatedProducts?: Product[]
  featuredProduct?: Product
}

export class AboutHandler {
  static async handleAboutQuery(
    query: string, 
    nlpResponse: NLPResponse,
    allProducts: Product[] = []
  ): Promise<AboutResponse> {
    const lowerQuery = query.toLowerCase()
    
    
    const productMatch = await this.extractProductFromQuery(query, allProducts)
    if (productMatch) {
      return this.handleProductAbout(productMatch, allProducts)
    }
    
    
    const brandMatch = this.extractBrandFromQuery(query, allProducts)
    if (brandMatch) {
      return this.handleBrandAbout(brandMatch, allProducts)
    }
    
    
    const categoryMatch = this.extractCategoryFromQuery(query)
    if (categoryMatch) {
      return this.handleCategoryAbout(categoryMatch, allProducts)
    }
    
    
    if (lowerQuery.includes('company') || lowerQuery.includes('who are you') || lowerQuery.includes('about us')) {
      return {
        text: `👋 **Nebula Fashion** is a premium online fashion retailer founded in 2020. We specialize in curated fashion collections that blend style, comfort, and affordability.

🌟 **Our Mission**: To make high-quality fashion accessible to everyone while maintaining sustainable practices.

📊 **Key Stats**:
• 30+ premium brands
• 1000+ satisfied customers
• 4.8/5 average customer rating
• Fast nationwide delivery

We're committed to providing exceptional customer service and helping you find your perfect style!`,
        type: 'company',
        suggestions: ['Our products', 'Contact us', 'Our mission', 'Brands we carry']
      }
    }
    
    
    if (lowerQuery.includes('products') || lowerQuery.includes('items') || lowerQuery.includes('collection')) {
      return {
        text: `🛍️ **Our Product Collection**

We offer a carefully curated selection of fashion items across multiple categories:

**👕 Categories**:
• Jackets - From casual bombers to premium leather
• Hoodies - Comfort meets style in various designs
• Pants - Track pants, jeans, chinos, and more
• Gloves - Style accessories for every occasion

**🏷️ Featured Brands**:
• Wink - Edgy, statement pieces
• Uniqlo - Minimalist comfort
• Zara - Trend-forward fashion
• Levi's - Classic denim
• Nike/Adidas - Sportswear excellence

**💰 Price Range**: ₹150 - ₹799
**⭐ Quality**: All products rated 4.0+ by customers

Each product is selected for quality, style, and value!`,
        type: 'products',
        suggestions: ['Show me jackets', 'Wink brand products', 'Products under ₹300', 'Best sellers']
      }
    }
    
    
    if (lowerQuery.includes('mission') || lowerQuery.includes('values') || lowerQuery.includes('purpose')) {
      return {
        text: `🎯 **Our Mission & Values**

**Vision**: To become India's most trusted fashion destination for quality-conscious shoppers.

**Core Values**:
1. **Quality First** - Every product undergoes strict quality checks
2. **Customer Happiness** - Your satisfaction is our priority
3. **Sustainable Fashion** - Eco-friendly packaging and ethical sourcing
4. **Innovation** - Continuously updating with latest trends
5. **Accessibility** - Fashion for every budget and style

**Sustainability Initiatives**:
• Eco-friendly packaging materials
• Carbon-neutral shipping options
• Support for local artisans
• Ethical manufacturing partners

We believe fashion should make you look good *and* feel good!`,
        type: 'mission',
        suggestions: ['Our products', 'Contact us', 'Sustainability', 'Brand partners']
      }
    }
    
    
    if (lowerQuery.includes('contact') || lowerQuery.includes('email') || lowerQuery.includes('phone') || lowerQuery.includes('support')) {
      return {
        text: `📞 **Contact & Support**

**Customer Support**:
• 📧 Email: support@nebulafashion.com
• 📱 Phone: +91 98765 43210
• 💬 Live Chat: Available 9 AM - 9 PM IST

**Office Address**:
Nebula Fashion Pvt. Ltd.
123 Style Street, Fashion District
Mumbai, Maharashtra 400001
India

**Business Hours**:
• Monday - Friday: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

**Social Media**:
• Instagram: @nebulafashion
• Twitter: @NebulaFashionHQ
• Facebook: /NebulaFashion

We typically respond within 2-4 hours during business days!`,
        type: 'contact',
        suggestions: ['Email support', 'Phone number', 'Business hours', 'Social media']
      }
    }
    
    
    if (lowerQuery.includes('help') || lowerQuery.includes('how to') || lowerQuery.includes('guide')) {
      return {
        text: `❓ **How Can I Help You?**

I'm your AI fashion assistant, and I can help you with:

**🛒 Shopping Assistance**:
• Find products by category, brand, or price
• Get personalized recommendations
• Compare different items
• Check product availability

**💡 Style Advice**:
• Outfit suggestions for occasions
• Seasonal fashion tips
• Mix and match guidance
• Trend updates

**🔍 Search Features**:
• "Show me jackets under ₹500"
• "Recommend products for winter"
• "Compare these two hoodies"
• "What's trending right now?"

**📱 How to use me**:
1. Ask specific questions about products
2. Use quick reply buttons for common queries
3. Try voice input for hands-free shopping
4. Save products you like for later

Just tell me what you're looking for!`,
        type: 'help',
        suggestions: ['Show me products', 'How to order', 'Return policy', 'Size guide']
      }
    }
    
    
    if (lowerQuery.includes('feature') || lowerQuery.includes('capability') || lowerQuery.includes('what can you do')) {
      return {
        text: `✨ **My Features & Capabilities**

**🤖 AI-Powered Assistance**:
• Natural language understanding - Ask me anything in plain English!
• Personalized recommendations based on your style
• Context-aware conversations - I remember what we talked about
• Voice input support for hands-free shopping

**🔍 Smart Search**:
• Search by category (jackets, hoodies, etc.)
• Filter by price range, brand, or rating
• Find similar products
• Seasonal and trending suggestions

**💬 Interactive Features**:
• Quick reply buttons for common questions
• Product comparison tools
• Save favorites for later
• Get style advice for different occasions

**📊 Product Intelligence**:
• Real-time pricing and availability
• Customer rating and review insights
• Seasonal relevance detection
• Value-for-money analysis

**🎯 Special Capabilities**:
• "Find products similar to [item]"
• "What should I wear for [occasion]?"
• "Show me the best [category] under [price]"
• "Compare these two products"

I'm here to make your shopping experience smarter and more enjoyable!`,
        type: 'features',
        suggestions: ['Try voice input', 'Show me recommendations', 'Compare products', 'Find similar items']
      }
    }
    
    
    return {
      text: `ℹ️ **About Nebula Fashion**

I'm your AI assistant for Nebula Fashion! Here's what I can help you with:

**Quick Facts**:
• Founded: 2020
• Products: 30+ curated fashion items
• Price Range: ₹150 - ₹799
• Customer Rating: 4.8/5 stars

**Ask me about**:
• Our company story and mission
• Available products and categories
• Contact information and support
• How to use this AI assistant
• Our features and capabilities

What would you like to know more about?`,
      type: 'help',
      suggestions: ['Company info', 'Products', 'Contact', 'Features', 'Help']
    }
  }

  private static async extractProductFromQuery(query: string, allProducts: Product[]): Promise<Product | null> {
    const lowerQuery = query.toLowerCase()
    
    
    for (const product of allProducts) {
      const productNameWords = product.name.toLowerCase().split(' ')
      
      
      const significantWords = productNameWords.filter(word => 
        word.length > 3 && !['printed', 'black', 'arm', 'track'].includes(word)
      )
      
      if (significantWords.some(word => lowerQuery.includes(word))) {
        return product
      }
      
      
      if (product.name.toLowerCase().split(' ').some(word => 
        lowerQuery.includes(word) && word.length > 4
      )) {
        return product
      }
    }
    
    
    const idMatch = query.match(/\bproduct\s*#?(\d+)\b/i)
    if (idMatch) {
      const productId = parseInt(idMatch[1])
      return allProducts.find(p => p.id === productId) || null
    }
    
    return null
  }

  private static extractBrandFromQuery(query: string, allProducts: Product[]): string | null {
    const lowerQuery = query.toLowerCase()
    const brands = Array.from(new Set(allProducts.map(p => p.brand.toLowerCase())))
    
    for (const brand of brands) {
      if (lowerQuery.includes(brand.toLowerCase()) || 
          lowerQuery.includes(`${brand.toLowerCase()} brand`) ||
          lowerQuery.includes(`brand ${brand.toLowerCase()}`)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1)
      }
    }
    
    return null
  }

  private static extractCategoryFromQuery(query: string): string | null {
    const lowerQuery = query.toLowerCase()
    const categories = ['jacket', 'hoodie', 'pants', 'gloves']
    
    for (const category of categories) {
      if (lowerQuery.includes(category) || 
          lowerQuery.includes(`${category}s`) ||
          lowerQuery.includes(`${category}es`)) {
        return category.charAt(0).toUpperCase() + category.slice(1)
      }
    }
    
    return null
  }

  private static async handleProductAbout(product: Product, allProducts: Product[]): Promise<AboutResponse> {
    
    const similarProducts = await SimilarProductFinder.findSimilarProducts(product, 3)
    const complementaryProducts = await SimilarProductFinder.findComplementaryProducts(product, 2)
    
    
    const valueScore = ProductRanker.calculateProductValue(product)
    const valueRating = valueScore > 0.4 ? 'Excellent' : 
                      valueScore > 0.3 ? 'Good' : 
                      valueScore > 0.2 ? 'Average' : 'Basic'
    
    
    const seasonalMultiplier = ProductRanker.getSeasonalMultiplier(product.category)
    const seasonalStatus = seasonalMultiplier >= 1.5 ? 'Highly Seasonal' :
                          seasonalMultiplier >= 1.2 ? 'Seasonally Relevant' :
                          'Year-round'
    
    const responseText = `📦 **About ${product.name}**

${product.description || 'A premium fashion item from our collection.'}

**Product Details**:
• **Brand**: ${product.brand}
• **Category**: ${product.category}
• **Price**: ₹${product.price}
• **Rating**: ${product.rating}/5 ⭐
• **Value Score**: ${valueRating} (${(valueScore * 100).toFixed(0)}/100)
• **Seasonal**: ${seasonalStatus}

**Why Choose This**:
${this.getProductHighlights(product)}

**Best For**:
${this.getProductUseCases(product)}

**Style Tips**:
${this.getStyleTips(product)}

**Similar Products Available**: ${similarProducts.length}+ items with comparable style and quality.`

    return {
      text: responseText,
      type: 'product',
      suggestions: [
        'Find similar products',
        `More from ${product.brand}`,
        `More ${product.category}s`,
        'Add to cart',
        'Compare with others'
      ],
      relatedProducts: [...similarProducts.map(sp => sp.product), ...complementaryProducts.map(cp => cp.product)],
      featuredProduct: product
    }
  }

  private static handleBrandAbout(brand: string, allProducts: Product[]): AboutResponse {
    const brandProducts = allProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase())
    const categories = Array.from(new Set(brandProducts.map(p => p.category)))
    const avgRating = brandProducts.reduce((sum, p) => sum + p.rating, 0) / brandProducts.length
    const priceRange = {
      min: Math.min(...brandProducts.map(p => p.price)),
      max: Math.max(...brandProducts.map(p => p.price))
    }
    
    const bestSelling = brandProducts.sort((a, b) => b.rating - a.rating).slice(0, 2)
    
    const responseText = `🏷️ **About ${brand} Brand**

${this.getBrandDescription(brand)}

**Brand Overview**:
• **Products Available**: ${brandProducts.length} items
• **Categories**: ${categories.join(', ')}
• **Price Range**: ₹${priceRange.min} - ₹${priceRange.max}
• **Average Rating**: ${avgRating.toFixed(1)}/5 ⭐
• **Brand Style**: ${this.getBrandStyle(brand)}

**Best Sellers**:
${bestSelling.map(p => `• ${p.name} - ₹${p.price} (${p.rating}/5 ⭐)`).join('\n')}

**Brand Philosophy**:
${this.getBrandPhilosophy(brand)}

**Why Choose ${brand}**:
${this.getBrandAdvantages(brand)}`

    return {
      text: responseText,
      type: 'brand',
      suggestions: [
        `Show all ${brand} products`,
        `Best rated from ${brand}`,
        `${brand} under ₹${Math.floor(priceRange.max * 0.7)}`,
        'Compare brands'
      ],
      relatedProducts: bestSelling
    }
  }

  private static handleCategoryAbout(category: string, allProducts: Product[]): AboutResponse {
    const categoryProducts = allProducts.filter(p => 
      p.category.toLowerCase() === category.toLowerCase() ||
      p.category.toLowerCase().includes(category.toLowerCase())
    )
    
    const brands = Array.from(new Set(categoryProducts.map(p => p.brand)))
    const avgRating = categoryProducts.reduce((sum, p) => sum + p.rating, 0) / categoryProducts.length
    const priceRange = {
      min: Math.min(...categoryProducts.map(p => p.price)),
      max: Math.max(...categoryProducts.map(p => p.price))
    }
    
    const topRated = categoryProducts.sort((a, b) => b.rating - a.rating).slice(0, 3)
    
    const responseText = `📁 **About ${category}s**

${this.getCategoryDescription(category)}

**Category Overview**:
• **Total Items**: ${categoryProducts.length} products
• **Brands Available**: ${brands.join(', ')}
• **Price Range**: ₹${priceRange.min} - ₹${priceRange.max}
• **Average Rating**: ${avgRating.toFixed(1)}/5 ⭐
• **Seasonal Relevance**: ${this.getCategorySeasonality(category)}

**Top Rated ${category}s**:
${topRated.map(p => `• ${p.name} (${p.brand}) - ₹${p.price} (${p.rating}/5 ⭐)`).join('\n')}

**Style Guide**:
${this.getCategoryStyleGuide(category)}

**Care Instructions**:
${this.getCategoryCareTips(category)}

**Popular Uses**:
${this.getCategoryUses(category)}`

    return {
      text: responseText,
      type: 'category',
      suggestions: [
        `Show all ${category}s`,
        `Best ${category}s under ₹500`,
        `New ${category} arrivals`,
        `${category} style guide`
      ],
      relatedProducts: topRated
    }
  }

  private static getProductHighlights(product: Product): string {
    const highlights = []
    
    if (product.rating >= 4.5) highlights.push('Premium quality with excellent customer ratings')
    if (product.price <= 300) highlights.push('Great value for money')
    if (product.description?.includes('premium') || product.description?.includes('quality')) 
      highlights.push('High-quality materials and craftsmanship')
    if (product.category === 'Jacket') highlights.push('Versatile for multiple occasions')
    if (product.category === 'Hoodie') highlights.push('Comfortable and stylish for casual wear')
    if (product.category === 'Pants') highlights.push('Perfect fit and durable construction')
    if (product.category === 'Gloves') highlights.push('Fashionable accessory that complements outfits')
    
    return highlights.map(h => `✓ ${h}`).join('\n')
  }

  private static getProductUseCases(product: Product): string {
    const useCases = []
    
    if (product.category === 'Jacket') {
      useCases.push('Casual outings and daily wear')
      useCases.push('Layered looks for colder weather')
      useCases.push('Making a fashion statement')
    } else if (product.category === 'Hoodie') {
      useCases.push('Relaxed weekend outfits')
      useCases.push('Athleisure and comfort wear')
      useCases.push('Layering under jackets')
    } else if (product.category === 'Pants') {
      useCases.push('Everyday comfortable wear')
      useCases.push('Sports and physical activities')
      useCases.push('Casual social gatherings')
    } else if (product.category === 'Gloves') {
      useCases.push('Winter accessory for warmth')
      useCases.push('Fashion statement piece')
      useCases.push('Special occasions and events')
    }
    
    return useCases.map(uc => `• ${uc}`).join('\n')
  }

  private static getStyleTips(product: Product): string {
    const tips = []
    
    if (product.category === 'Jacket') {
      tips.push('Pair with simple t-shirts for a balanced look')
      tips.push('Works well with jeans or casual pants')
      tips.push('Adds edge to any outfit')
    } else if (product.category === 'Hoodie') {
      tips.push('Layer with denim jackets for stylish contrast')
      tips.push('Match with track pants for sporty look')
      tips.push('Perfect for minimalist, comfortable outfits')
    } else if (product.category === 'Pants') {
      tips.push('Combine with hoodies for sporty style')
      tips.push('Pair with fitted tops for balanced silhouette')
      tips.push('Works with both sneakers and casual shoes')
    } else if (product.category === 'Gloves') {
      tips.push('Coordinate with jacket colors')
      tips.push('Use as statement piece with neutral outfits')
      tips.push('Perfect for completing winter looks')
    }
    
    return tips.map(tip => `• ${tip}`).join('\n')
  }

  private static getBrandDescription(brand: string): string {
    const descriptions: Record<string, string> = {
      'Wink': 'Known for edgy, statement-making fashion pieces that blend bold designs with quality craftsmanship. Popular among trendsetters and fashion-forward individuals.',
      'Uniqlo': 'Japanese brand famous for minimalist design, high-quality basics, and innovative fabric technology. Focuses on comfort, functionality, and timeless style.',
      'Zara': 'Spanish fast-fashion leader known for quickly adapting to the latest trends while maintaining reasonable prices and decent quality.',
      'Nike': 'World-renowned sportswear brand offering innovative athletic apparel with cutting-edge technology and iconic designs.',
      'Adidas': 'German sportswear manufacturer known for classic designs, quality materials, and a perfect blend of sports and street style.',
      'Levi\'s': 'Iconic American denim brand with over a century of heritage, known for durable, comfortable, and stylish jeans and jackets.',
      'H&M': 'Affordable fashion retailer offering trendy pieces across all categories with frequent new collections.',
      'Puma': 'Sport-lifestyle brand combining functionality with street-style aesthetics in athletic and casual wear.'
    }
    
    return descriptions[brand] || `${brand} is one of our trusted fashion brands offering quality products across various categories.`
  }

  private static getBrandStyle(brand: string): string {
    const styles: Record<string, string> = {
      'Wink': 'Edgy, Bold, Statement-making, Fashion-forward',
      'Uniqlo': 'Minimalist, Functional, Timeless, Comfort-focused',
      'Zara': 'Trendy, Contemporary, Versatile, Fast-fashion',
      'Nike': 'Athletic, Innovative, Performance-oriented, Iconic',
      'Adidas': 'Sporty, Classic, Street-style, Heritage',
      'Levi\'s': 'Classic, Durable, Authentic, Heritage',
      'H&M': 'Trendy, Affordable, Versatile, Accessible'
    }
    
    return styles[brand] || 'Quality fashion with versatile styling options'
  }

  private static getBrandPhilosophy(brand: string): string {
    const philosophies: Record<string, string> = {
      'Wink': 'Empowering self-expression through bold fashion choices and unique designs.',
      'Uniqlo': 'Making high-quality, functional clothing accessible to everyone through innovative materials and simple designs.',
      'Zara': 'Democratizing fashion by quickly bringing the latest trends to customers at affordable prices.',
      'Nike': 'Bringing inspiration and innovation to every athlete in the world (and everyone is an athlete).',
      'Adidas': 'Through sport, we have the power to change lives by creating products that improve performance.'
    }
    
    return philosophies[brand] || 'Committed to quality, style, and customer satisfaction in every product.'
  }

  private static getBrandAdvantages(brand: string): string {
    const advantages: Record<string, string[]> = {
      'Wink': [
        'Unique, eye-catching designs',
        'High-quality materials',
        'Great for making fashion statements',
        'Good value for premium designs'
      ],
      'Uniqlo': [
        'Exceptional fabric quality',
        'Timeless designs that last',
        'Innovative technologies',
        'Excellent comfort and fit'
      ],
      'Zara': [
        'Latest trends quickly available',
        'Wide variety of styles',
        'Affordable fashion',
        'Frequent new collections'
      ]
    }
    
    const defaultAdvantages = [
      'Quality craftsmanship',
      'Reliable brand reputation',
      'Good customer satisfaction',
      'Wide size availability'
    ]
    
    return (advantages[brand] || defaultAdvantages)
      .map(a => `✓ ${a}`)
      .join('\n')
  }

  private static getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'Jacket': 'Outerwear pieces designed for style, comfort, and protection from elements. From casual bombers to premium leather, jackets are versatile wardrobe essentials.',
      'Hoodie': 'Comfortable pullovers or zip-ups with hoods, perfect for casual wear, lounging, and sporty looks. Modern hoodies blend style with coziness.',
      'Pants': 'Lower body garments ranging from athletic track pants to stylish jeans and chinos. Designed for comfort, movement, and style.',
      'Gloves': 'Fashion accessories and functional hand coverings. From winter warmth to stylish statements, gloves complete outfits.'
    }
    
    return descriptions[category] || `Premium ${category.toLowerCase()} selection offering style, comfort, and quality.`
  }

  private static getCategorySeasonality(category: string): string {
    const seasonality: Record<string, string> = {
      'Jacket': 'Most popular in Winter and Autumn, but lightweight options work year-round',
      'Hoodie': 'Year-round essential, especially popular in cooler months',
      'Pants': 'Year-round staple with seasonal variations in materials',
      'Gloves': 'Primarily Winter accessory, but fashion gloves work year-round'
    }
    
    return seasonality[category] || 'Versatile year-round wear'
  }

  private static getCategoryStyleGuide(category: string): string {
    const guides: Record<string, string> = {
      'Jacket': '• Choose fit based on layering needs\n• Match with complementary colors\n• Consider occasion (casual vs formal)\n• Pay attention to material quality',
      'Hoodie': '• Balance oversized fits with fitted bottoms\n• Layer with jackets for dimension\n• Choose colors that complement your wardrobe\n• Consider fabric weight for season',
      'Pants': '• Ensure proper length and fit\n• Match with appropriate footwear\n• Consider rise based on body type\n• Choose fabric for intended use',
      'Gloves': '• Match with outerwear style\n• Consider functionality vs fashion\n• Choose materials for intended climate\n• Ensure proper fit for comfort'
    }
    
    return guides[category] || 'Focus on fit, material quality, and how it complements your existing wardrobe.'
  }

  private static getCategoryCareTips(category: string): string {
    const tips: Record<string, string> = {
      'Jacket': '• Follow specific material care instructions\n• Store properly to maintain shape\n• Clean stains immediately\n• Avoid excessive washing',
      'Hoodie': '• Wash inside out to preserve prints\n• Use cold water to prevent shrinkage\n• Air dry when possible\n• Fold instead of hanging',
      'Pants': '• Wash similar colors together\n• Follow fabric-specific instructions\n• Iron on appropriate settings\n• Store folded to prevent creases',
      'Gloves': '• Hand wash delicate materials\n• Air dry completely\n• Store flat to maintain shape\n• Keep away from direct heat'
    }
    
    return tips[category] || 'Follow care label instructions, wash with similar colors, and store properly.'
  }

  private static getCategoryUses(category: string): string {
    const uses: Record<string, string[]> = {
      'Jacket': ['Daily casual wear', 'Outdoor activities', 'Layered outfits', 'Style statements'],
      'Hoodie': ['Casual weekends', 'Athleisure wear', 'Lounge comfort', 'Sporty looks'],
      'Pants': ['Everyday comfort', 'Sports activities', 'Casual outings', 'Work from home'],
      'Gloves': ['Winter warmth', 'Fashion accessories', 'Special events', 'Outdoor activities']
    }
    
    return (uses[category] || ['Versatile wear', 'Multiple occasions', 'Style enhancement'])
      .map(u => `• ${u}`)
      .join('\n')
  }

  static generateQuickReplies(type: AboutResponse['type'], context?: { product?: Product; brand?: string; category?: string }): string[] {
    switch (type) {
      case 'product':
        if (context?.product) {
          return [
            `Find similar to ${context.product.name}`,
            `More from ${context.product.brand}`,
            `Show all ${context.product.category}s`,
            'Compare with others',
            'Add to cart'
          ]
        }
        return ['Find products', 'Show categories', 'Best sellers', 'New arrivals']
        
      case 'brand':
        if (context?.brand) {
          return [
            `Show all ${context.brand} products`,
            `Best rated from ${context.brand}`,
            'Compare brands',
            'Brand story'
          ]
        }
        return ['Popular brands', 'Brand comparison', 'All brands', 'New brands']
        
      case 'category':
        if (context?.category) {
          return [
            `Show all ${context.category}s`,
            `Best ${context.category}s`,
            `${context.category} under ₹500`,
            `${context.category} style guide`
          ]
        }
        return ['All categories', 'Category guide', 'Popular items', 'Seasonal picks']
        
      case 'company':
        return ['Our products', 'Contact us', 'Our mission', 'Team']
        
      case 'products':
        return ['Show me jackets', 'Wink products', 'Under ₹300', 'Best rated']
        
      case 'mission':
        return ['Sustainability', 'Our partners', 'Careers', 'Community']
        
      case 'contact':
        return ['Email us', 'Call support', 'Visit store', 'Social media']
        
      case 'help':
        return ['How to order', 'Size guide', 'Return policy', 'Track order']
        
      case 'features':
        return ['Try voice', 'Show features', 'Demo', 'Tutorial']
        
      default:
        return ['Products', 'Company', 'Contact', 'Help']
    }
  }
}