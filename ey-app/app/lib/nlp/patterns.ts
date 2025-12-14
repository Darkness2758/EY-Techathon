export const CATEGORY_PATTERNS = {
  jackets: /\b(jackets?|coat|outerwear|windcheater|blazer)\b/i,
  hoodies: /\b(hoodies?|sweatshirt|pullover|crewneck)\b/i,
  pants: /\b(pants?|trousers?|jeans|leggings?|track pants?)\b/i,
  accessories: /\b(accessories?|gloves?|arm warmers?|scarf|hat|cap)\b/i,
  all: /\b(all products?|everything|show me everything|browse)\b/i
}

export const BRAND_PATTERNS = {
  wink: /\b(wink|wink brand|wink products?)\b/i,
  generic: /\b(brand|brands?|specific brand|company)\b/i
}

export const PRICE_PATTERNS = {
  under: /\b(under|below|less than|cheaper than|maximum|upto|up to)\s*[₹$]?\s*(\d+)/i,
  above: /\b(above|over|more than|expensive than|minimum|at least)\s*[₹$]?\s*(\d+)/i,
  between: /\b(between|from|range)\s*[₹$]?\s*(\d+)\s*(?:and|to|-)\s*[₹$]?\s*(\d+)/i,
  exact: /\b(exactly|price of|costing)\s*[₹$]?\s*(\d+)/i
}

export const INTENT_PATTERNS = {
  showProducts: /\b(show|display|list|see|view|find|look for|search for)\b/i,
  recommendations: /\b(recommend|suggest|what should i buy|what\'s good|best|top|popular|trending)\b/i,
  comparison: /\b(compare|vs\.?|versus|difference between|which is better)\b/i,
  help: /\b(help|how to|what can you do|assist|support)\b/i,
  filter: /\b(filter|sort|arrange|organize|order by)\b/i,
  categories: /\b(categories?|types?|kinds?|what do you have)\b/i
}

export const FEATURE_PATTERNS = {
  color: /\b(black|white|red|blue|green|yellow|brown|grey|gray|pink|purple|orange)\b/i,
  material: /\b(cotton|wool|leather|denim|polyester|nylon|silk|linen)\b/i,
  size: /\b(small|medium|large|xl|xxl|xs|extra small|extra large)\b/i,
  season: /\b(winter|summer|spring|fall|autumn|rainy|monsoon|cold|hot)\b/i
}