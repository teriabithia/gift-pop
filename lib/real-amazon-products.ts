import type { Gift } from "./types"

// Real products from various online retailers for fallback when AI generates invalid links
export const realMultiPlatformProducts: Gift[] = [
  // Electronics - Various Platforms
  {
    id: "real-1",
    name: "iPad Air (5th Gen)",
    brand: "Apple",
    price: 599.99,
    rating: 4.8,
    reviewCount: 15000,
    image: "/ipad-air.jpg",
    shopUrl: "https://www.apple.com/ipad-air/",
    category: "Electronics",
    tags: ["trending", "apple"],
  },
  {
    id: "real-2", 
    name: "Nintendo Switch Console",
    brand: "Nintendo",
    price: 299.99,
    rating: 4.6,
    reviewCount: 25000,
    image: "/nintendo-switch.jpg", 
    shopUrl: "https://www.target.com/p/nintendo-switch-console/-/A-52052007",
    category: "Electronics",
    tags: ["gaming", "entertainment"],
  },
  {
    id: "real-3",
    name: "Sony WH-1000XM4 Headphones",
    brand: "Sony", 
    price: 279.99,
    rating: 4.7,
    reviewCount: 30000,
    image: "/sony-headphones.jpg",
    shopUrl: "https://www.bestbuy.com/site/sony-wh-1000xm4-wireless-noise-canceling-over-the-ear-headphones-black/6408356.p",
    category: "Electronics", 
    tags: ["wireless", "music"],
  },
  {
    id: "real-4",
    name: "Fitbit Versa 3",
    brand: "Fitbit",
    price: 199.99,
    rating: 4.5,
    reviewCount: 12000,
    image: "/fitbit-versa.jpg",
    shopUrl: "https://www.walmart.com/ip/Fitbit-Versa-3-Health-Fitness-Smartwatch-with-GPS-24-7-Heart-Rate-Alexa-Built-in-6-Day-Battery-Black-Black-Aluminum/126455362",
    category: "Electronics",
    tags: ["fitness", "health"],
  },
  // Home & Kitchen - Various Platforms
  {
    id: "real-5",
    name: "KitchenAid Stand Mixer",
    brand: "KitchenAid",
    price: 349.99,
    rating: 4.8,
    reviewCount: 20000,
    image: "/kitchenaid-mixer.jpg",
    shopUrl: "https://www.williams-sonoma.com/products/kitchenaid-artisan-stand-mixer/",
    category: "Home & Kitchen",
    tags: ["cooking", "baking"],
  },
  {
    id: "real-6",
    name: "Dyson V15 Detect Vacuum",
    brand: "Dyson",
    price: 749.99,
    rating: 4.6,
    reviewCount: 8000,
    image: "/dyson-vacuum.jpg",
    shopUrl: "https://www.dyson.com/vacuum-cleaners/cordless/v15/detect-absolute",
    category: "Home & Kitchen",
    tags: ["cleaning", "cordless"],
  },
  // Beauty & Personal Care - Various Platforms
  {
    id: "real-7",
    name: "Fenty Beauty Gloss Bomb",
    brand: "Fenty Beauty",
    price: 19.00,
    rating: 4.5,
    reviewCount: 12000,
    image: "/fenty-gloss.jpg",
    shopUrl: "https://www.sephora.com/product/gloss-bomb-universal-lip-luminizer-P41879221",
    category: "Beauty",
    tags: ["makeup", "lips"],
  },
  {
    id: "real-8",
    name: "Handmade Ceramic Mug",
    brand: "LocalArtisan",
    price: 32.00,
    rating: 4.9,
    reviewCount: 850,
    image: "/ceramic-mug.jpg",
    shopUrl: "https://www.etsy.com/listing/handmade-ceramic-coffee-mug",
    category: "Home & Living",
    tags: ["handmade", "pottery"],
  },
  // Books - Various Platforms
  {
    id: "real-9",
    name: "The Seven Husbands of Evelyn Hugo",
    brand: "St. Martin's Press",
    price: 16.99,
    rating: 4.8,
    reviewCount: 50000,
    image: "/evelyn-hugo.jpg",
    shopUrl: "https://www.barnesandnoble.com/w/the-seven-husbands-of-evelyn-hugo-taylor-jenkins-reid/1125990916",
    category: "Books",
    tags: ["fiction", "bestseller"],
  },
  // Fashion - Various Platforms
  {
    id: "real-10",
    name: "Levi's 501 Original Jeans",
    brand: "Levi's",
    price: 89.50,
    rating: 4.7,
    reviewCount: 8000,
    image: "/levis-jeans.jpg",
    shopUrl: "https://www.levi.com/US/en_US/apparel/clothing/bottoms/501-original-fit-mens-jeans/p/005010000",
    category: "Fashion",
    tags: ["denim", "classic"],
  }
]

// Function to get random real products for fallback
export function getRealMultiPlatformProducts(count: number = 4): Gift[] {
  const shuffled = [...realMultiPlatformProducts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map((product, index) => ({
    ...product,
    id: `real-fallback-${index + 1}`
  }))
}

// Keep old function name for backward compatibility
export function getRealAmazonProducts(count: number = 4): Gift[] {
  return getRealMultiPlatformProducts(count)
}
