const { PrismaClient } = require('@prisma/client');

async function testListCreation() {
  const prisma = new PrismaClient();
  
  try {
    console.log("=== 测试列表创建功能 ===");
    
    // 1. 检查是否有用户
    const users = await prisma.user.findMany();
    console.log(`数据库中的用户数量: ${users.length}`);
    
    if (users.length === 0) {
      console.log("❌ 没有用户，无法测试列表创建");
      return;
    }
    
    const testUser = users[0];
    console.log(`使用测试用户: ${testUser.email} (ID: ${testUser.id})`);
    
    // 2. 直接在数据库中创建一个测试列表
    const testList = await prisma.giftList.create({
      data: {
        name: "测试列表 - " + new Date().toLocaleString(),
        description: "通过脚本创建的测试列表",
        isPublic: false,
        userId: testUser.id
      }
    });
    
    console.log("✅ 成功创建测试列表:");
    console.log(`   ID: ${testList.id}`);
    console.log(`   名称: ${testList.name}`);
    console.log(`   用户ID: ${testList.userId}`);
    console.log(`   创建时间: ${testList.createdAt}`);
    
    // 3. 验证列表是否正确保存
    const savedList = await prisma.giftList.findUnique({
      where: { id: testList.id },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    if (savedList) {
      console.log("✅ 列表验证成功:");
      console.log(`   关联用户: ${savedList.user.email}`);
      console.log(`   是否公开: ${savedList.isPublic}`);
    }
    
    // 4. 检查总列表数量
    const totalLists = await prisma.giftList.count();
    console.log(`📊 数据库中总列表数量: ${totalLists}`);
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testListCreation();
