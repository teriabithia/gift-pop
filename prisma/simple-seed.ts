import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始数据库种子数据生成...')

  // 清理现有数据
  console.log('🧹 清理现有数据...')
  await prisma.shareLink.deleteMany()
  await prisma.listItem.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.quizAnswer.deleteMany()
  await prisma.giftList.deleteMany()
  await prisma.gift.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  // 创建测试用户
  console.log('👤 创建测试用户...')
  const demoUser = await prisma.user.create({
    data: {
      id: 'demo-user-1',
      email: 'demo@giftpop.com',
      name: 'Demo User',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      emailVerified: new Date(),
    },
  })

  // 创建礼品数据
  console.log('🎁 创建礼品数据...')
  
  const gifts = [
    {
      name: 'Wireless Noise-Canceling Headphones',
      brand: 'SoundTech Pro',
      price: 199.99,
      rating: 4.8,
      reviewCount: 2547,
      image: '/images/headphones-wireless.jpg',
      shopUrl: 'https://example.com/headphones',
      category: 'Electronics',
      description: 'Premium wireless headphones with active noise cancellation.',
      tags: JSON.stringify(['wireless', 'noise-canceling', 'premium', 'music']),
      occasions: JSON.stringify(['birthday', 'graduation', 'christmas']),
      targetDemographics: JSON.stringify({ age: '18-25', gender: 'any', interests: ['technology', 'music'] }),
      popularityScore: 95.5,
    },
    {
      name: 'Aromatherapy Essential Oil Diffuser',
      brand: 'Zen Living',
      price: 67.99,
      rating: 4.9,
      reviewCount: 2156,
      image: '/aromatherapy-diffuser.png',
      shopUrl: 'https://example.com/diffuser',
      category: 'Home & Living',
      description: 'Ultrasonic diffuser with 7 LED colors and timer settings.',
      tags: JSON.stringify(['aromatherapy', 'wellness', 'relaxation', 'home']),
      occasions: JSON.stringify(['housewarming', 'mothers-day', 'christmas']),
      targetDemographics: JSON.stringify({ age: '26-35', gender: 'female', interests: ['wellness', 'home'] }),
      popularityScore: 87.3,
    },
    {
      name: 'Gourmet Chocolate Collection',
      brand: 'Sweet Delights',
      price: 39.99,
      rating: 4.8,
      reviewCount: 1543,
      image: '/gourmet-chocolate-gift-box.png',
      shopUrl: 'https://example.com/chocolate',
      category: 'Food & Beverage',
      description: 'Artisan chocolate collection with 24 unique flavors.',
      tags: JSON.stringify(['chocolate', 'gourmet', 'sweet', 'gift-box']),
      occasions: JSON.stringify(['valentines', 'mothers-day', 'anniversary']),
      targetDemographics: JSON.stringify({ age: '26-35', gender: 'any', interests: ['food', 'luxury'] }),
      popularityScore: 91.2,
    },
    {
      name: 'Premium Tea Sampler Set',
      brand: 'Tea Masters',
      price: 32.50,
      rating: 4.9,
      reviewCount: 892,
      image: '/premium-tea-sampler.png',
      shopUrl: 'https://example.com/tea-set',
      category: 'Food & Beverage',
      description: 'Collection of 12 premium loose-leaf teas from around the world.',
      tags: JSON.stringify(['tea', 'premium', 'sampler', 'wellness']),
      occasions: JSON.stringify(['mothers-day', 'thanksgiving', 'christmas']),
      targetDemographics: JSON.stringify({ age: '46-60', gender: 'any', interests: ['wellness', 'tea'] }),
      popularityScore: 86.8,
    },
    {
      name: 'Elegant Silk Scarf',
      brand: 'Fashion Elite',
      price: 55.00,
      rating: 4.5,
      reviewCount: 789,
      image: '/elegant-floral-silk-scarf.png',
      shopUrl: 'https://example.com/scarf',
      category: 'Fashion',
      description: '100% silk scarf with hand-painted floral design.',
      tags: JSON.stringify(['silk', 'elegant', 'fashion', 'luxury']),
      occasions: JSON.stringify(['mothers-day', 'valentines', 'anniversary']),
      targetDemographics: JSON.stringify({ age: '26-35', gender: 'female', interests: ['fashion', 'luxury'] }),
      popularityScore: 78.9,
    }
  ]

  const createdGifts = await Promise.all(
    gifts.map((gift) => prisma.gift.create({ data: gift }))
  )

  console.log(`✅ 创建了 ${createdGifts.length} 个礼品`)

  // 创建礼品清单
  console.log('📋 创建礼品清单...')
  
  const demoList = await prisma.giftList.create({
    data: {
      name: "妈妈的生日礼物",
      userId: demoUser.id,
      description: "为妈妈精心挑选的生日礼物清单",
      isPublic: false,
      metadata: JSON.stringify({
        theme: "birthday",
        recipient: "mother",
        budget: "100-300"
      })
    },
  })

  // 为清单添加礼品项目
  await prisma.listItem.create({
    data: {
      listId: demoList.id,
      giftId: createdGifts[1].id, // Aromatherapy Diffuser
      sortOrder: 0,
      note: "这个很适合妈妈！",
      customData: JSON.stringify({
        priority: "high",
        purchased: false
      })
    },
  })

  // 创建问答记录
  console.log('❓ 创建问答记录...')
  
  const quizAnswer = await prisma.quizAnswer.create({
    data: {
      userId: demoUser.id,
      sessionId: 'demo-session-123',
      answers: JSON.stringify({
        relationship: "mother",
        gender: "female",
        ageRange: "50-65",
        interests: ["wellness", "reading", "gardening"],
        budgetRange: "50-150",
        specialPreferences: "喜欢天然有机的产品"
      }),
      preferences: JSON.stringify({
        categories: ["Health & Beauty", "Home & Living", "Books"],
        occasions: ["mothers-day", "birthday"],
        priceRange: { min: 50, max: 150 }
      })
    },
  })

  console.log('✅ 种子数据生成完成!')
  console.log(`
📊 生成统计:
  👤 用户: 1
  🎁 礼品: ${createdGifts.length}
  📋 清单: 1
  ❓ 问答: 1
  
🔑 测试账号:
  邮箱: demo@giftpop.com
  (开发环境下可直接登录)
  `)
}

main()
  .catch((e) => {
    console.error('❌ 种子数据生成失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

