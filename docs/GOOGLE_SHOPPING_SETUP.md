# Google Content API for Shopping 设置指南

## 概述
本应用使用Google Content API for Shopping来获取真实的商品信息和购买链接，确保所有推荐的商品都有有效的购买渠道。

## 设置步骤

### 1. 创建Google Cloud项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下API：
   - Content API for Shopping
   - Google Shopping API

### 2. 创建服务账号
1. 在IAM & Admin > Service Accounts中创建服务账号
2. 下载JSON密钥文件
3. 将密钥文件安全保存

### 3. 获取API密钥
1. 在APIs & Services > Credentials中创建API密钥
2. 复制API密钥

### 4. 配置环境变量
在`.env.local`文件中添加：
```bash
GOOGLE_SHOPPING_API_KEY=your_api_key_here
GOOGLE_MERCHANT_ID=your_merchant_id_here
```

### 5. 设置配额和限制
- 默认配额：1000 requests/day
- 可以申请提高配额
- 建议启用缓存以减少API调用

## API功能特性

### 产品搜索
- 基于AI生成的搜索关键词
- 返回真实商品信息
- 包含价格、品牌、图片、购买链接

### 数据转换
- 自动转换为应用内Gift格式
- 处理缺失数据
- 智能回退机制

### 缓存策略
- 15分钟缓存时间
- 减少重复API调用
- 提高响应速度

## 错误处理

### API不可用时的回退
1. 使用Google Shopping搜索链接
2. 生成通用产品信息
3. 保持用户体验连续性

### 常见错误
- 401: API密钥无效
- 403: 配额超限
- 429: 请求频率过高

## 测试和验证

### 本地测试
```bash
# 测试API连接
curl "https://shoppingcontent.googleapis.com/content/v2.1/products/search?q=test&key=YOUR_API_KEY"
```

### 生产环境
- 监控API使用量
- 设置告警阈值
- 定期检查配额状态

## 成本控制

### 免费配额
- 每天1000次请求免费
- 超出部分按使用量计费

### 优化建议
- 实现智能缓存
- 批量处理请求
- 使用搜索关键词优化

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
- Google Cloud支持：https://cloud.google.com/support
- API文档：https://developers.google.com/shopping-content
- 社区论坛：https://stackoverflow.com/questions/tagged/google-shopping-api
