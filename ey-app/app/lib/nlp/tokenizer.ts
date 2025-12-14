export class TextTokenizer {
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s₹$.,!?-]/g, '')
      .replace(/\s+/g, ' ')
  }

  static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[\s.,!?]+/)
      .filter(token => token.length > 0)
  }

  static extractKeywords(tokens: string[]): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'i', 'you', 'he',
      'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its',
      'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'this', 'that', 'these', 'those'
    ])

    return tokens.filter(token => 
      !stopWords.has(token) && 
      token.length > 2 &&
      !/^\d+$/.test(token)
    )
  }

  static stemWord(word: string): string {
    // Simple stemming for common English patterns
    const rules: [RegExp, string][] = [
      [/ies$/, 'y'],
      [/es$/, ''],
      [/s$/, ''],
      [/ing$/, ''],
      [/ed$/, ''],
      [/er$/, ''],
      [/est$/, '']
    ]

    for (const [pattern, replacement] of rules) {
      if (pattern.test(word)) {
        return word.replace(pattern, replacement)
      }
    }
    return word
  }

  static extractNumbers(text: string): number[] {
    const matches = text.match(/\b\d+(?:\.\d+)?\b/g)
    return matches ? matches.map(Number) : []
  }

  static extractCurrency(text: string): number | null {
    const match = text.match(/[₹$]\s*(\d+(?:\.\d+)?)/)
    return match ? parseFloat(match[1]) : null
  }

  // Additional utility methods
  static extractEmails(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const matches = text.match(emailRegex)
    return matches || []
  }

  static extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g
    const matches = text.match(hashtagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  static extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g
    const matches = text.match(mentionRegex)
    return matches ? matches.map(mention => mention.substring(1)) : []
  }

  static countWords(text: string): number {
    return this.tokenize(text).length
  }

  static countCharacters(text: string): number {
    return text.length
  }

  static getReadingTime(text: string, wordsPerMinute: number = 200): number {
    const wordCount = this.countWords(text)
    return Math.ceil(wordCount / wordsPerMinute)
  }

  static removeSpecialCharacters(text: string): string {
    return text.replace(/[^\w\s₹$.,!?-]/g, '')
  }

  static removeExtraSpaces(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
  }

  static toTitleCase(text: string): string {
    return text.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - suffix.length) + suffix
  }

  static containsAny(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase()
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
  }

  static containsAll(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase()
    return keywords.every(keyword => lowerText.includes(keyword.toLowerCase()))
  }

  static similarityScore(text1: string, text2: string): number {
    const tokens1 = new Set(this.tokenize(text1))
    const tokens2 = new Set(this.tokenize(text2))
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)))
    const union = new Set([...tokens1, ...tokens2])
    
    return union.size === 0 ? 0 : intersection.size / union.size
  }

  static extractSentences(text: string): string[] {
    return text.split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
  }

  static getMostFrequentWords(text: string, limit: number = 10): [string, number][] {
    const tokens = this.tokenize(text)
    const frequency: Record<string, number> = {}
    
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1
    })
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
  }

  static extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g
    const matches = text.match(urlRegex)
    return matches || []
  }

  static isQuestion(text: string): boolean {
    const questionWords = ['what', 'where', 'when', 'who', 'why', 'how', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does', 'did']
    const tokens = this.tokenize(text)
    return tokens.some(token => questionWords.includes(token)) || text.trim().endsWith('?')
  }

  static extractPhoneNumbers(text: string): string[] {
    const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g
    const matches = text.match(phoneRegex)
    return matches || []
  }

  static removeStopWords(text: string): string {
    const tokens = this.tokenize(text)
    const keywords = this.extractKeywords(tokens)
    return keywords.join(' ')
  }

  static extractDates(text: string): string[] {
    const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g
    const matches = text.match(dateRegex)
    return matches || []
  }

  static normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
  }

  static extractProductCodes(text: string): string[] {
    const codeRegex = /\b[A-Z]{2,}\d{3,}\b|\b\d{3,}[A-Z]{2,}\b/g
    const matches = text.match(codeRegex)
    return matches || []
  }

  static extractSize(text: string): string[] {
    const sizeRegex = /\b(XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL)\b|\b(\d+(\.\d+)?)\s*(cm|in|inch|inches)\b/i
    const matches = text.match(sizeRegex)
    return matches || []
  }

  static extractColor(text: string): string[] {
    const colors = [
      'red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'grey',
      'orange', 'purple', 'pink', 'brown', 'navy', 'beige', 'cream', 'gold',
      'silver', 'bronze', 'maroon', 'teal', 'turquoise', 'violet', 'indigo'
    ]
    
    const tokens = this.tokenize(text)
    return tokens.filter(token => colors.includes(token))
  }

  static extractMaterial(text: string): string[] {
    const materials = [
      'cotton', 'wool', 'leather', 'denim', 'polyester', 'nylon', 'silk',
      'linen', 'velvet', 'suede', 'cashmere', 'fleece', 'canvas', 'corduroy'
    ]
    
    const tokens = this.tokenize(text)
    return tokens.filter(token => materials.includes(token))
  }

  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
  }

  static isNumeric(text: string): boolean {
    return /^\d+(\.\d+)?$/.test(text)
  }

  static isAlphabetic(text: string): boolean {
    return /^[A-Za-z]+$/.test(text)
  }

  static isAlphanumeric(text: string): boolean {
    return /^[A-Za-z0-9]+$/.test(text)
  }

  static reverse(text: string): string {
    return text.split('').reverse().join('')
  }

  static removeDiacritics(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  static compress(text: string): string {
    return text.replace(/(.)\1+/g, '$1')
  }
}