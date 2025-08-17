import type { Gift } from "./types"

// Real Amazon products with verified ASINs for fallback when AI generates invalid links
export const realAmazonProducts: Gift[] = [
  // Electronics
  {
    id: "real-1",
    name: "Echo Dot (5th Gen)",
    brand: "Amazon",
    price: 49.99,
    rating: 4.7,
    reviewCount: 15000,
    image: "/echo-dot.jpg",
    shopUrl: "https://www.amazon.com/dp/B09B8V1LZ3",
    category: "Electronics",
    tags: ["trending", "smart home"],
  },
  {
    id: "real-2", 
    name: "Fire TV Stick 4K",
    brand: "Amazon",
    price: 54.99,
    rating: 4.6,
    reviewCount: 25000,
    image: "/fire-tv-stick.jpg", 
    shopUrl: "https://www.amazon.com/dp/B08XVYZ1Y5",
    category: "Electronics",
    tags: ["streaming", "entertainment"],
  },
  {
    id: "real-3",
    name: "Anker PowerCore 10000 Portable Charger",
    brand: "Anker", 
    price: 29.99,
    rating: 4.7,
    reviewCount: 30000,
    image: "/anker-charger.jpg",
    shopUrl: "https://www.amazon.com/dp/B019Q1E8Q4",
    category: "Electronics", 
    tags: ["portable", "charging"],
  },
  {
    id: "real-4",
    name: "Bluetooth Wireless Earbuds",
    brand: "JBL",
    price: 79.99,
    rating: 4.5,
    reviewCount: 12000,
    image: "/jbl-earbuds.jpg",
    shopUrl: "https://www.amazon.com/dp/B08T1B1QMX",
    category: "Electronics",
    tags: ["wireless", "music"],
  },
  // Home & Kitchen
  {
    id: "real-5",
    name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    brand: "Instant Pot",
    price: 89.99,
    rating: 4.8,
    reviewCount: 20000,
    image: "/instant-pot.jpg",
    shopUrl: "https://www.amazon.com/dp/B08PQ2KWHS",
    category: "Home & Kitchen",
    tags: ["cooking", "kitchen"],
  },
  {
    id: "real-6",
    name: "Ninja Foodi Personal Blender",
    brand: "Ninja",
    price: 69.99,
    rating: 4.6,
    reviewCount: 8000,
    image: "/ninja-blender.jpg",
    shopUrl: "https://www.amazon.com/dp/B08T6QTQZJ",
    category: "Home & Kitchen",
    tags: ["blender", "smoothies"],
  },
  // Health & Personal Care
  {
    id: "real-7",
    name: "Fitbit Inspire 2 Health & Fitness Tracker",
    brand: "Fitbit",
    price: 69.95,
    rating: 4.5,
    reviewCount: 12000,
    image: "/fitbit-inspire.jpg",
    shopUrl: "https://www.amazon.com/dp/B08DFGZ8Z9",
    category: "Health & Personal Care",
    tags: ["fitness", "health"],
  },
  {
    id: "real-8",
    name: "Essential Oil Diffuser",
    brand: "URPOWER",
    price: 39.99,
    rating: 4.4,
    reviewCount: 15000,
    image: "/oil-diffuser.jpg",
    shopUrl: "https://www.amazon.com/dp/B013A2S6FE",
    category: "Health & Personal Care",
    tags: ["aromatherapy", "relaxation"],
  },
  // Books
  {
    id: "real-9",
    name: "Atomic Habits by James Clear",
    brand: "Avery",
    price: 13.99,
    rating: 4.8,
    reviewCount: 50000,
    image: "/atomic-habits.jpg",
    shopUrl: "https://www.amazon.com/dp/0735211299",
    category: "Books",
    tags: ["self-help", "productivity"],
  },
  // Home & Garden
  {
    id: "real-10",
    name: "Cozy Knit Throw Blanket",
    brand: "Bedsure",
    price: 25.99,
    rating: 4.7,
    reviewCount: 8000,
    image: "/throw-blanket.jpg",
    shopUrl: "https://www.amazon.com/dp/B08SWLF87V",
    category: "Home & Garden",
    tags: ["cozy", "comfort"],
  }
]

// Function to get random real products for fallback
export function getRealAmazonProducts(count: number = 4): Gift[] {
  const shuffled = [...realAmazonProducts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map((product, index) => ({
    ...product,
    id: `real-fallback-${index + 1}`
  }))
}
