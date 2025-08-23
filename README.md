# GiftPop - AI-Powered Gift Recommendation Platform

## 🎁 项目简介

GiftPop 是一个基于AI的智能礼物推荐平台，帮助用户为不同场合、不同关系的人找到最合适的礼物。平台集成了OpenAI的AI推荐引擎和eBay的商品搜索API，提供个性化的礼物推荐服务。

## ✨ 核心功能

### 🧠 AI智能推荐
- **个性化推荐**: 基于用户偏好、关系、年龄等因素的AI推荐
- **热门推荐**: 当前流行的礼物推荐
- **场合推荐**: 针对生日、节日、纪念日等特定场合的推荐
- **智能筛选**: AI分析eBay商品，筛选最合适的礼物

### 👥 用户系统
- **Google OAuth登录**: 支持Google账户快速登录
- **用户管理**: 用户注册、登录、个人资料管理
- **礼物列表**: 创建、管理个人礼物列表

### 📋 礼物列表管理
- **创建列表**: 为不同场合创建专属礼物列表
- **添加礼物**: 从推荐中选择礼物添加到列表
- **分享功能**: 生成分享链接，邀请他人选择礼物
- **协作选择**: 多人协作选择礼物，避免重复

### 🔍 商品搜索
- **eBay集成**: 实时搜索eBay商品数据
- **关键词优化**: AI生成优化的搜索关键词
- **商品分析**: AI分析商品信息，提供推荐理由

## 🏗️ 技术架构

### 前端技术
- **Next.js 15**: React全栈框架，支持SSR和SSG
- **React 19**: 最新版本的React框架
- **TypeScript**: 类型安全的JavaScript开发
- **Tailwind CSS**: 实用优先的CSS框架
- **Radix UI**: 无样式的UI组件库
- **Lucide React**: 精美的图标库

### 后端技术
- **Next.js API Routes**: 服务端API接口
- **Prisma ORM**: 现代化的数据库ORM
- **PostgreSQL**: 主数据库（Neon云数据库）
- **NextAuth.js**: 身份认证解决方案

### AI和第三方服务
- **OpenAI API**: GPT模型用于礼物推荐和关键词生成
- **eBay API**: 商品搜索和数据获取
- **Google OAuth**: 用户身份认证

### 部署和基础设施
- **Vercel**: 前端部署和CDN
- **Neon**: PostgreSQL云数据库
- **GitHub**: 代码版本控制

## 📁 项目结构

```
giftpop/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API路由
│   │   ├── auth/          # 认证相关API
│   │   ├── lists/         # 礼物列表API
│   │   ├── recommendations/ # 推荐系统API
│   │   └── shared/        # 分享功能API
│   ├── components/        # 页面组件
│   ├── contexts/          # React Context
│   ├── hooks/             # 自定义Hooks
│   ├── lib/               # 工具库和配置
│   ├── styles/            # 全局样式
│   └── wizard/            # 礼物推荐向导
├── prisma/                # 数据库配置和模型
├── components/            # 可复用UI组件
├── docs/                  # 项目文档
└── scripts/               # 构建和部署脚本
```

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 pnpm
- PostgreSQL 数据库

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/giftpop.git
cd giftpop
```

2. **安装依赖**
```bash
npm install
# 或
pnpm install
```

3. **环境变量配置**
创建 `.env.local` 文件：
```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# eBay API
EBAY_CLIENT_ID="your-ebay-client-id"
EBAY_CLIENT_SECRET="your-ebay-client-secret"
```

4. **数据库设置**
```bash
# 生成Prisma Client
npm run db:generate

# 推送数据库schema
npm run db:push

# 启动Prisma Studio
npm run db:studio
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 🗄️ 数据库模型

### 核心模型

#### User (用户)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  password      String?
  provider      String?   @default("email")
  providerId    String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts        Account[]
  sessions        Session[]
  giftLists       GiftList[]
  quizAnswers     QuizAnswer[]
  recommendations Recommendation[]
  shareLinks      ShareLink[]
}
```

#### GiftList (礼物列表)
```prisma
model GiftList {
  id             String      @id @default(cuid())
  name           String
  userId         String
  description    String?
  isPublic       Boolean     @default(false)
  shareId        String?     @unique
  shareToken     String?     @unique
  shareExpiresAt DateTime?
  metadata       String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  
  user           User        @relation(fields: [userId], references: [id])
  listItems      ListItem[]
  shareLinks     ShareLink[]
}
```

#### ListItem (列表项目)
```prisma
model ListItem {
  id            String    @id @default(cuid())
  listId        String
  giftId        String
  sortOrder     Int       @default(0)
  note          String?
  customData    String?
  addedAt       DateTime  @default(now())
  isSelected    Boolean   @default(false)
  selectedBy    String?
  selectionNote String?
  selectedAt    DateTime?
  
  gift          Gift      @relation(fields: [giftId], references: [id])
  giftList      GiftList  @relation(fields: [listId], references: [id])
}
```

## 🔌 API接口

### 认证相关

#### POST /api/auth/register
用户注册
```typescript
{
  email: string;
  password: string;
  name?: string;
}
```

#### POST /api/auth/callback/credentials
用户登录
```typescript
{
  email: string;
  password: string;
}
```

### 礼物列表

#### GET /api/lists
获取用户的礼物列表
```typescript
Response: {
  lists: GiftList[];
}
```

#### POST /api/lists
创建新的礼物列表
```typescript
{
  name: string;
  description?: string;
  isPublic?: boolean;
}
```

#### POST /api/lists/[id]/items
添加礼物到列表
```typescript
{
  giftId: string;
  note?: string;
}
```

### 推荐系统

#### POST /api/recommendations/enhanced
获取AI推荐礼物
```typescript
{
  type: "personalized" | "popular" | "occasion";
  occasion?: string;
  preferences?: {
    relationship: string;
    gender: string;
    ageRange: string;
    interests?: string[];
    budget?: number;
  };
}
```

### 分享功能

#### GET /api/shared/[shareId]
获取分享的礼物列表
```typescript
Response: {
  list: GiftList;
  items: ListItem[];
}
```

#### POST /api/shared/[shareId]/select
选择/取消选择礼物
```typescript
{
  giftId: string;
  selectedBy: string;
  selectionNote?: string;
  action: "select" | "deselect";
}
```

## 🎨 用户界面

### 主要页面

1. **首页** (`/`)
   - 动态英雄区域
   - 功能介绍
   - 快速开始按钮

2. **推荐向导** (`/wizard/step-1`, `/wizard/step-2`, `/wizard/step-3`)
   - 三步式推荐流程
   - 收集用户偏好
   - 生成个性化推荐

3. **个性化推荐** (`/recommendations`)
   - 基于偏好的AI推荐
   - 礼物卡片展示
   - 添加到列表功能

4. **热门推荐** (`/popular`)
   - 当前流行礼物
   - 分类浏览
   - 快速添加

5. **场合推荐** (`/occasions/[occasion]`)
   - 特定场合推荐
   - 节日主题
   - 关系分类

6. **我的列表** (`/my-lists`)
   - 个人礼物列表管理
   - 创建新列表
   - 编辑和删除

7. **列表详情** (`/my-lists/[id]`)
   - 列表内容展示
   - 礼物管理
   - 分享功能

### 组件系统

- **GiftCard**: 礼物卡片组件
- **ListSelectionModal**: 列表选择模态框
- **CreateListModal**: 创建列表模态框
- **Navigation**: 导航组件
- **Footer**: 页脚组件
- **Toast**: 通知组件

## 🔧 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和Hooks
- 使用Tailwind CSS进行样式设计

### 状态管理
- 使用React Context进行全局状态管理
- 本地状态使用useState和useReducer
- 异步操作使用useEffect和自定义Hooks

### 数据获取
- 服务端组件使用Prisma直接查询
- 客户端组件使用fetch API
- 实现适当的错误处理和加载状态

### 测试
```bash
# 运行测试
npm run test

# 运行E2E测试
npm run e2e

# 代码覆盖率
npm run test:coverage
```

## 🚀 部署

### Vercel部署

1. **连接GitHub仓库**
2. **配置环境变量**
3. **自动部署**

### 环境变量配置

在Vercel Dashboard中配置以下环境变量：
- `DATABASE_URL`: Neon PostgreSQL连接字符串
- `NEXTAUTH_SECRET`: NextAuth密钥
- `NEXTAUTH_URL`: 生产环境URL
- `GOOGLE_CLIENT_ID`: Google OAuth客户端ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth客户端密钥
- `OPENAI_API_KEY`: OpenAI API密钥
- `EBAY_CLIENT_ID`: eBay API客户端ID
- `EBAY_CLIENT_SECRET`: eBay API客户端密钥

### 数据库部署

1. **创建Neon PostgreSQL数据库**
2. **运行数据库迁移**
```bash
npx prisma migrate deploy
```

## 📊 性能优化

### 前端优化
- Next.js 13+ App Router
- 组件懒加载
- 图片优化
- 代码分割

### 后端优化
- 数据库索引优化
- API响应缓存
- 连接池管理
- 异步处理

### 监控和分析
- Vercel Analytics
- 错误监控
- 性能指标
- 用户行为分析

## 🔒 安全特性

- **身份认证**: NextAuth.js + Google OAuth
- **数据验证**: Zod schema验证
- **SQL注入防护**: Prisma ORM
- **XSS防护**: React内置防护
- **CSRF保护**: NextAuth.js内置
- **环境变量**: 敏感信息保护

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📝 更新日志

### v0.1.0 (MVP版本)
- ✅ 基础用户认证系统
- ✅ AI礼物推荐引擎
- ✅ 礼物列表管理
- ✅ 分享和协作功能
- ✅ eBay商品集成
- ✅ 响应式用户界面
- ✅ 生产环境部署

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者: [Your Name]
- 邮箱: [your.email@example.com]
- 项目链接: [https://github.com/your-username/giftpop](https://github.com/your-username/giftpop)

## 🙏 致谢

- Next.js团队提供的优秀框架
- Prisma团队提供的现代化ORM
- OpenAI提供的AI服务
- eBay提供的商品数据API
- 所有贡献者和用户的支持

---

**GiftPop** - 让礼物选择变得简单而智能 🎁✨
