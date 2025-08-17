// 详细测试SerpApi服务
const SERPAPI_API_KEY = '7995644c75ccd9ddf7b7caac3a3d009665e71c9500d038f95873bcd88edb44da';

async function testSerpApiDetailed() {
  try {
    console.log('🔍 Detailed SerpApi test...');
    
    // 测试API连接
    const testQuery = 'iPhone 15';
    const url = `https://serpapi.com/search?api_key=${SERPAPI_API_KEY}&engine=google_shopping&q=${encodeURIComponent(testQuery)}&num=2`;
    
    console.log(`📡 Calling SerpApi: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }
    
    console.log('✅ SerpApi connection successful!');
    console.log(`🛒 Found ${data.shopping_results?.length || 0} shopping results`);
    
    // 显示完整的响应结构
    console.log('\n📋 Response structure:');
    console.log('Keys in data:', Object.keys(data));
    
    if (data.shopping_results && data.shopping_results.length > 0) {
      console.log('\n🔍 First shopping result structure:');
      const firstResult = data.shopping_results[0];
      console.log('Keys in first result:', Object.keys(firstResult));
      
      console.log('\n📝 First result details:');
      for (const [key, value] of Object.entries(firstResult)) {
        console.log(`   ${key}: ${value}`);
      }
      
      // 检查是否有其他可能的链接字段
      const linkFields = ['link', 'url', 'href', 'product_link', 'shopping_link'];
      console.log('\n🔗 Checking for link fields:');
      for (const field of linkFields) {
        if (firstResult[field]) {
          console.log(`   Found ${field}: ${firstResult[field]}`);
        }
      }
    }
    
    console.log('\n🎉 Detailed test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// 运行测试
testSerpApiDetailed();
