# Google Custom Search API + Shopping 设置指南

## 概述
本应用使用Google Custom Search API + Shopping来搜索全网商品并获取真实的购买链接，确保所有推荐的商品都有有效的购买渠道。

## 设置步骤

### 1. 创建Google Cloud项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下API：
   - Custom Search API
   - Shopping API

### 2. 创建服务账号
1. 在IAM & Admin > Service Accounts中创建服务账号
2. 下载JSON密钥文件
3. 将密钥文件安全保存

### 3. 创建Custom Search Engine
1. 访问 [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. 创建新的搜索引擎
3. 配置搜索引擎设置：
   - 搜索整个网络
   - 启用Shopping搜索
   - 获取搜索引擎ID (cx)

### 4. 获取API密钥
1. 在Google Cloud Console > APIs & Services > Credentials中创建API密钥
2. 复制API密钥

### 5. 配置环境变量
在`.env.local`文件中添加：
```bash
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 6. 设置配额和限制
- 默认配额：100 requests/day (免费)
- 付费版本：10,000 requests/day ($5/1000 queries)
- 建议启用缓存以减少API调用

## API功能特性

### 全网商品搜索
- 基于AI生成的搜索关键词
- 搜索整个互联网的商品信息
- 返回真实商品信息：价格、品牌、图片、购买链接
- 支持所有电商平台：Amazon、Target、Walmart、Best Buy等

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
- 403: 配额超限或搜索引擎ID无效
- 429: 请求频率过高
- 400: 搜索查询格式错误

## 测试和验证

### 本地测试
```bash
# 测试Custom Search API连接
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=test&searchType=shopping"
```

### 生产环境
- 监控API使用量
- 设置告警阈值
- 定期检查配额状态

## 成本控制

### 免费配额
- 每天100次请求免费
- 付费版本：$5/1000 queries
- 适合中小型应用使用

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
- Custom Search API文档：https://developers.google.com/custom-search
- 搜索引擎创建：https://programmablesearchengine.google.com/
- 社区论坛：https://stackoverflow.com/questions/tagged/google-custom-search-api
