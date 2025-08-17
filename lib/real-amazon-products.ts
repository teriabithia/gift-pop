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
    shopUrl: "https://www.google.com/search?q=iPad+Air+buy+online&tbm=shop",
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
    shopUrl: "https://www.google.com/search?q=Nintendo+Switch+console+buy&tbm=shop",
    category: "Electronics",
    tags: ["gaming", "entertainment"],
  },
  {
    id: "real-3",
    name: "AirPods Pro",
    brand: "Apple", 
    price: 249.99,
    rating: 4.7,
    reviewCount: 30000,
    image: "/airpods-pro.jpg",
    shopUrl: "https://www.google.com/search?q=AirPods+Pro+buy+online&tbm=shop",
    category: "Electronics", 
    tags: ["wireless", "music"],
  },
  {
    id: "real-4",
    name: "Instant Pot",
    brand: "Instant Pot",
    price: 89.99,
    rating: 4.5,
    reviewCount: 12000,
    image: "/instant-pot.jpg",
    shopUrl: "https://www.google.com/search?q=Instant+Pot+7+in+1+buy&tbm=shop",
    category: "Home & Kitchen",
    tags: ["cooking", "kitchen"],
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
    shopUrl: "https://www.google.com/search?q=KitchenAid+stand+mixer+buy&tbm=shop",
    category: "Home & Kitchen",
    tags: ["cooking", "baking"],
  },
  {
    id: "real-6",
    name: "Dyson Vacuum",
    brand: "Dyson",
    price: 399.99,
    rating: 4.6,
    reviewCount: 8000,
    image: "/dyson-vacuum.jpg",
    shopUrl: "https://www.google.com/search?q=Dyson+vacuum+cleaner+buy&tbm=shop",
    category: "Home & Kitchen",
    tags: ["cleaning", "cordless"],
  },
  // Beauty & Personal Care - Various Platforms
  {
    id: "real-7",
    name: "Beauty Products",
    brand: "Sephora",
    price: 25.00,
    rating: 4.5,
    reviewCount: 12000,
    image: "/beauty-products.jpg",
    shopUrl: "https://www.google.com/search?q=beauty+makeup+products+buy&tbm=shop",
    category: "Beauty",
    tags: ["makeup", "skincare"],
  },
  {
    id: "real-8",
    name: "Handmade Crafts",
    brand: "Etsy Artisans",
    price: 35.00,
    rating: 4.9,
    reviewCount: 850,
    image: "/handmade-crafts.jpg",
    shopUrl: "https://www.google.com/search?q=handmade+ceramic+mug+buy&tbm=shop",
    category: "Home & Living",
    tags: ["handmade", "unique"],
  },
  // Books - Various Platforms
  {
    id: "real-9",
    name: "Popular Books",
    brand: "Barnes & Noble",
    price: 18.99,
    rating: 4.8,
    reviewCount: 50000,
    image: "/bestseller-books.jpg",
    shopUrl: "https://www.google.com/search?q=bestseller+books+buy+online&tbm=shop",
    category: "Books",
    tags: ["fiction", "bestseller"],
  },
  // Fashion - Various Platforms
  {
    id: "real-10",
    name: "Fashion Items",
    brand: "Macy's",
    price: 75.00,
    rating: 4.7,
    reviewCount: 8000,
    image: "/fashion-items.jpg",
    shopUrl: "https://www.google.com/search?q=fashion+clothing+buy+online&tbm=shop",
    category: "Fashion",
    tags: ["clothing", "style"],
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
