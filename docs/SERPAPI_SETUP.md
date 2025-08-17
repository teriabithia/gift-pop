# SerpApi Google Product Search 设置指南

## 概述
本应用使用SerpApi的Google Product搜索来获取真实的购物结果，确保所有推荐的商品都有有效的购买链接。

## 设置步骤

### 1. 注册SerpApi账户
1. 访问 [SerpApi官网](https://serpapi.com/)
2. 注册免费账户
3. 验证邮箱地址

### 2. 获取API密钥
1. 登录SerpApi控制台
2. 在API Keys部分找到你的密钥
3. 复制API密钥

### 3. 配置环境变量
在`.env.local`文件中添加：
```bash
SERPAPI_API_KEY=your_serpapi_api_key_here
```

### 4. API功能特性

#### Google Product搜索
- 基于AI生成的搜索关键词
- 搜索Google Product页面获取真实商品信息
- 返回真实商品数据：价格、品牌、图片、购买链接、评分、评论数
- 支持所有电商平台：Amazon、Target、Walmart、Best Buy等

#### 数据转换
- 自动转换为应用内Gift格式
- 智能处理缺失数据
- 品牌名称自动提取
- 价格和评分数据解析

#### 缓存策略
- 15分钟缓存时间
- 减少重复API调用
- 提高响应速度

## API限制和定价

### 免费计划
- 每月100次搜索
- 适合开发和测试

### 付费计划
- 基础计划：$50/月，5,000次搜索
- 专业计划：$100/月，15,000次搜索
- 企业计划：自定义定价

## 错误处理

### API不可用时的回退
1. 使用Google Shopping搜索链接
2. 生成通用产品信息
3. 保持用户体验连续性

### 常见错误
- 401: API密钥无效
- 429: 配额超限
- 500: 服务器错误

## 测试和验证

### 本地测试
```bash
# 测试SerpApi连接
curl "https://serpapi.com/search?api_key=YOUR_API_KEY&engine=google_product&q=test"
```

### 生产环境
- 监控API使用量
- 设置告警阈值
- 定期检查配额状态

## 成本控制

### 优化建议
- 实现智能缓存
- 批量处理请求
- 使用搜索关键词优化
- 合理设置缓存时间

## 安全注意事项

### API密钥保护
- 不要在代码中硬编码
- 使用环境变量
- 定期轮换密钥

### 访问控制
- 限制API密钥权限
- 监控异常使用
- 设置IP白名单（可选）

## 故障排除

### 常见问题
1. **API返回空结果**
   - 检查搜索关键词
   - 验证API密钥
   - 确认配额状态

2. **响应缓慢**
   - 检查网络连接
   - 优化缓存策略
   - 减少并发请求

3. **数据不完整**
   - 检查数据转换逻辑
   - 验证API响应格式
   - 查看错误日志

## 联系支持
- SerpApi支持：https://serpapi.com/support
- API文档：https://serpapi.com/docs
- 社区论坛：https://github.com/serpapi/serpapi-nodejs
- 状态页面：https://status.serpapi.com/

## 示例响应

### 成功响应
```json
{
  "search_metadata": {
    "status": "Success",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "product_results": [
    {
      "product_id": "12345",
      "title": "Apple iPad Air 5th Generation",
      "price": "$599.00",
      "currency": "USD",
      "rating": 4.8,
      "reviews": 1250,
      "thumbnail": "https://example.com/ipad.jpg",
      "link": "https://amazon.com/ipad-air",
      "source": "Amazon",
      "shipping": "Free",
      "condition": "New"
    }
  ]
}
```

### 错误响应
```json
{
  "error": "API key not found",
  "search_metadata": {
    "status": "Error"
  }
}
```
