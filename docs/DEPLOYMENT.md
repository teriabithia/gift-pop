# GiftPop 部署指南

## 🚀 快速开始

### 本地开发环境

1. **克隆项目并安装依赖**
   ```bash
   git clone <your-repo-url>
   cd giftpop0815
   pnpm install
   ```

2. **配置环境变量**
   ```bash
   cp env.example .env.local
   # 编辑 .env.local 填入实际配置
   ```

3. **启动数据库服务**
   ```bash
   docker-compose up postgres redis -d
   ```

4. **数据库迁移和种子数据**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

访问 http://localhost:3000 查看应用。

### 使用 Docker 开发

```bash
# 启动完整开发环境
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

## 📦 生产部署

### Vercel 部署 (推荐)

1. **连接 GitHub 仓库到 Vercel**
2. **配置环境变量**
   - `DATABASE_URL`: PostgreSQL 连接字符串
   - `REDIS_URL`: Redis 连接字符串
   - `NEXTAUTH_SECRET`: 随机密钥
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth

3. **数据库迁移**
   ```bash
   # 在 Vercel 项目设置中添加构建命令
   pnpm db:generate && pnpm build
   ```

### 自托管部署

1. **构建 Docker 镜像**
   ```bash
   docker build -f Dockerfile.dev --target production -t giftpop:latest .
   ```

2. **使用 docker-compose 生产配置**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ | - |
| `REDIS_HOST` | Redis 主机地址 | ✅ | localhost |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | ✅ | - |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | ❌ | - |
| `REC_WEIGHT_CATEGORY` | 推荐分类权重 | ❌ | 0.25 |

### 数据库配置

推荐使用以下数据库服务：
- **开发**: Docker PostgreSQL + Redis
- **生产**: 
  - PostgreSQL: Supabase, PlanetScale, Railway
  - Redis: Upstash, Redis Cloud

### 缓存策略

- **静态内容**: 1小时缓存
- **API 响应**: 5-30分钟缓存  
- **推荐结果**: 30分钟缓存
- **热门数据**: 10分钟缓存

## 🚦 健康检查

应用提供以下健康检查端点：

- `GET /api/health` - 基础健康检查
- `GET /api/health/db` - 数据库连接检查
- `GET /api/health/redis` - Redis 连接检查

## 📊 监控和日志

### 推荐监控工具

- **APM**: Sentry, DataDog
- **日志**: Vercel Analytics, LogRocket
- **性能**: Lighthouse CI, Web Vitals

### 关键指标

- 响应时间 < 200ms (P95)
- 错误率 < 1%
- 可用性 > 99.9%
- 缓存命中率 > 80%

## 🔐 安全配置

### 必需的安全措施

1. **HTTPS**: 强制使用 HTTPS
2. **CSP**: 内容安全策略
3. **CORS**: 跨域请求限制
4. **限流**: API 请求频率限制
5. **输入验证**: Zod schema 验证

### 敏感信息管理

- 使用环境变量存储密钥
- 定期轮换 API 密钥
- 启用数据库连接加密

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查连接字符串格式
   # 确认数据库服务运行状态
   docker-compose logs postgres
   ```

2. **Redis 连接失败**
   ```bash
   # 检查 Redis 服务状态
   docker-compose logs redis
   ```

3. **构建失败**
   ```bash
   # 清理缓存重新构建
   pnpm clean
   pnpm install
   pnpm build
   ```

### 性能优化

1. **数据库查询优化**
   - 使用适当的索引
   - 避免 N+1 查询
   - 使用连接池

2. **缓存优化**
   - 合理设置 TTL
   - 使用缓存预热
   - 监控缓存命中率

3. **前端优化**
   - 图片懒加载
   - 代码分割
   - CDN 加速

## 📈 扩展策略

### 水平扩展

1. **应用层**: 多实例部署
2. **数据库**: 读写分离
3. **缓存**: Redis 集群
4. **CDN**: 静态资源分发

### 垂直扩展

1. **服务器配置升级**
2. **数据库性能调优**
3. **内存缓存优化**

## 🔄 CI/CD 流程

### 自动化流程

1. **代码提交** → 触发 CI
2. **代码检查** → ESLint + Prettier
3. **类型检查** → TypeScript
4. **单元测试** → Jest
5. **E2E 测试** → Playwright
6. **安全扫描** → Trivy + npm audit
7. **构建检查** → Next.js build
8. **部署** → Vercel (主分支)

### 部署策略

- **开发分支**: 自动部署到预览环境
- **主分支**: 自动部署到生产环境
- **回滚**: 支持一键回滚到前一版本

## 📞 支持

如需技术支持，请：

1. 查看 [故障排除文档](./TROUBLESHOOTING.md)
2. 搜索 [GitHub Issues](https://github.com/your-org/giftpop/issues)
3. 创建新的 Issue 描述问题

