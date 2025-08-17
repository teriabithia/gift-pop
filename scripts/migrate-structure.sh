#!/bin/bash

# GiftPop 目录结构迁移脚本
# 保留 Git 历史的文件移动

set -e

echo "🚀 开始 GiftPop 目录结构迁移..."

# 创建新的目录结构
echo "📁 创建目标目录结构..."

mkdir -p src/{app,features,server,components,lib,hooks,styles,types}

# App Router 路由组
mkdir -p src/app/\(marketing\)/{about,faq}
mkdir -p src/app/\(public\)/{popular,occasions,wizard,shared/\[shareId\]}
mkdir -p src/app/\(protected\)/{my-lists,recommendations,profile}
mkdir -p src/app/api/v1/{auth,gifts,lists,recommendations,shared}

# Features 按功能切片
mkdir -p src/features/{auth,gifts,lists,recommendations,wizard}/{components,hooks}

# Server 层
mkdir -p src/server/{actions,services/{interfaces,implementations},repositories/{interfaces,implementations/{prisma,cache}},middleware,utils}

# Components
mkdir -p src/components/{ui,layout,common}

# Lib
mkdir -p src/lib/{auth,db,utils,validations,types}

# 移动现有文件 (保留 Git 历史)
echo "🔄 移动现有文件..."

# 移动 app 目录
if [ -d "app" ]; then
    echo "移动 app/ 到 src/app/..."
    git mv app/* src/app/ 2>/dev/null || true
    # 处理特殊文件
    [ -f "app/globals.css" ] && git mv app/globals.css src/styles/globals.css 2>/dev/null || true
    rmdir app 2>/dev/null || true
fi

# 移动 components
if [ -d "components" ]; then
    echo "移动 components/ 到 src/components/..."
    git mv components/* src/components/ 2>/dev/null || true
    rmdir components 2>/dev/null || true
fi

# 移动 contexts 到 features
if [ -d "contexts" ]; then
    echo "移动 contexts/ 到对应的 features/..."
    [ -f "contexts/auth-context.tsx" ] && git mv contexts/auth-context.tsx src/features/auth/hooks/use-auth.tsx 2>/dev/null || true
    [ -f "contexts/lists-context.tsx" ] && git mv contexts/lists-context.tsx src/features/lists/hooks/use-lists.tsx 2>/dev/null || true
    [ -f "contexts/wizard-context.tsx" ] && git mv contexts/wizard-context.tsx src/features/wizard/hooks/use-wizard.tsx 2>/dev/null || true
    rmdir contexts 2>/dev/null || true
fi

# 移动 hooks
if [ -d "hooks" ]; then
    echo "移动 hooks/ 到 src/hooks/..."
    git mv hooks/* src/hooks/ 2>/dev/null || true
    rmdir hooks 2>/dev/null || true
fi

# 移动 lib
if [ -d "lib" ]; then
    echo "移动 lib/ 到 src/lib/..."
    git mv lib/* src/lib/ 2>/dev/null || true
    rmdir lib 2>/dev/null || true
fi

# 移动 styles
if [ -d "styles" ]; then
    echo "移动 styles/ 到 src/styles/..."
    git mv styles/* src/styles/ 2>/dev/null || true
    rmdir styles 2>/dev/null || true
fi

# 重新组织路由到路由组
echo "🎯 重新组织路由到路由组..."

# 营销页面 (SSG)
[ -f "src/app/page.tsx" ] && git mv src/app/page.tsx src/app/\(marketing\)/page.tsx 2>/dev/null || true
[ -d "src/app/faq" ] && git mv src/app/faq src/app/\(marketing\)/faq 2>/dev/null || true

# 公开页面 (SSR)
[ -d "src/app/popular" ] && git mv src/app/popular src/app/\(public\)/popular 2>/dev/null || true
[ -d "src/app/occasions" ] && git mv src/app/occasions src/app/\(public\)/occasions 2>/dev/null || true
[ -d "src/app/wizard" ] && git mv src/app/wizard src/app/\(public\)/wizard 2>/dev/null || true

# 受保护页面
[ -d "src/app/my-lists" ] && git mv src/app/my-lists src/app/\(protected\)/my-lists 2>/dev/null || true
[ -d "src/app/recommendations" ] && git mv src/app/recommendations src/app/\(protected\)/recommendations 2>/dev/null || true

echo "✅ 目录结构迁移完成！"

# 验证迁移结果
echo "🔍 验证迁移结果..."
echo "src/ 目录结构："
tree src/ -I node_modules 2>/dev/null || find src -type d | sort

echo ""
echo "⚠️  接下来需要："
echo "1. 运行导入修复脚本: npm run fix-imports"
echo "2. 更新 tsconfig.json 路径别名"
echo "3. 更新 tailwind.config.js 内容路径"
echo "4. 测试构建: npm run build"

echo ""
echo "🎉 迁移脚本执行完成！"

