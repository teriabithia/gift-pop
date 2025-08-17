import type { Gift } from './types'

export interface ShoppingOption {
  name: string
  url: string
  description: string
  priority: number // 1-5, 5 being highest priority
}

export function generateSmartShoppingLinks(gift: Gift): ShoppingOption[] {
  const productName = `${gift.name} ${gift.brand}`.trim()
  const encodedName = encodeURIComponent(productName)
  const category = gift.category.toLowerCase()

  const options: ShoppingOption[] = []

  // Always include Google Shopping as primary option
  options.push({
    name: 'Google Shopping',
    url: `https://www.google.com/search?q=${encodedName}+buy&tbm=shop`,
    description: 'Compare prices from all retailers',
    priority: 5
  })

  // Category-specific recommendations
  if (category.includes('electronics') || category.includes('tech')) {
    options.push({
      name: 'Best Buy',
      url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedName}`,
      description: 'Electronics specialist with expert support',
      priority: 4
    })
  }

  if (category.includes('beauty') || category.includes('skincare')) {
    options.push({
      name: 'Sephora',
      url: `https://www.sephora.com/search?keyword=${encodedName}`,
      description: 'Beauty products with expert reviews',
      priority: 4
    })
  }

  if (category.includes('books')) {
    options.push({
      name: 'Barnes & Noble',
      url: `https://www.barnesandnoble.com/s/${encodedName}`,
      description: 'Books with member discounts',
      priority: 4
    })
  }

  if (category.includes('home') || category.includes('kitchen')) {
    options.push({
      name: 'Williams Sonoma',
      url: `https://www.williams-sonoma.com/search/results.html?words=${encodedName}`,
      description: 'Premium home and kitchen items',
      priority: 3
    })
  }

  // Always include major retailers
  options.push({
    name: 'Amazon',
    url: `https://www.amazon.com/s?k=${encodedName}`,
    description: 'Fast delivery and wide selection',
    priority: 4
  })

  options.push({
    name: 'Target',
    url: `https://www.target.com/s?searchTerm=${encodedName}`,
    description: 'Quality products with in-store pickup',
    priority: 3
  })

  options.push({
    name: 'Walmart',
    url: `https://www.walmart.com/search?q=${encodedName}`,
    description: 'Everyday low prices',
    priority: 3
  })

  // Sort by priority (highest first) and return top 5
  return options
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
}

// Generate a single best shopping link based on product category
export function getBestShoppingLink(gift: Gift): string {
  const options = generateSmartShoppingLinks(gift)
  return options[0]?.url || `https://www.google.com/search?q=${encodeURIComponent(gift.name + ' buy')}&tbm=shop`
}
