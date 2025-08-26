const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

async function testAPIWithSession() {
  console.log("=== 测试API端点列表创建 ===");
  
  try {
    // 1. 首先测试没有session的情况
    console.log("1. 测试无session的API调用...");
    const responseNoAuth = await fetch('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "测试列表 - 无认证",
        description: "",
        isPublic: false
      })
    });
    
    const resultNoAuth = await responseNoAuth.json();
    console.log(`   状态码: ${responseNoAuth.status}`);
    console.log(`   响应: ${JSON.stringify(resultNoAuth)}`);
    
    // 2. 检查当前数据库状态
    console.log("\n2. 检查数据库状态...");
    const prisma = new PrismaClient();
    const listCount = await prisma.giftList.count();
    console.log(`   数据库中的列表数量: ${listCount}`);
    
    // 3. 显示现有列表
    const lists = await prisma.giftList.findMany({
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log("\n3. 现有列表:");
    lists.forEach((list, index) => {
      console.log(`   ${index + 1}. ${list.name} (用户: ${list.user.email})`);
    });
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error("❌ API测试失败:", error.message);
  }
}

testAPIWithSession();
