#!/usr/bin/env ts-node

/**
 * GiftPop 导入路径修复 Codemod
 * 使用 ts-morph 批量修复相对导入为别名导入
 */

import { Project, SyntaxKind, ImportDeclaration } from 'ts-morph'
import * as path from 'path'
import * as fs from 'fs'

interface ImportMapping {
  pattern: RegExp
  replacement: string
}

const importMappings: ImportMapping[] = [
  // 组件导入
  { pattern: /^\.\.?\/.*\/components\/(.+)$/, replacement: '@/components/$1' },
  { pattern: /^@\/components\/(.+)$/, replacement: '@/components/$1' },
  
  // Features 导入
  { pattern: /^\.\.?\/.*\/contexts\/auth-context$/, replacement: '@/features/auth/hooks/use-auth' },
  { pattern: /^\.\.?\/.*\/contexts\/lists-context$/, replacement: '@/features/lists/hooks/use-lists' },
  { pattern: /^\.\.?\/.*\/contexts\/wizard-context$/, replacement: '@/features/wizard/hooks/use-wizard' },
  
  // Hooks 导入
  { pattern: /^\.\.?\/.*\/hooks\/(.+)$/, replacement: '@/hooks/$1' },
  
  // Lib 导入
  { pattern: /^\.\.?\/.*\/lib\/(.+)$/, replacement: '@/lib/$1' },
  
  // Server 导入
  { pattern: /^\.\.?\/.*\/server\/(.+)$/, replacement: '@/server/$1' },
  
  // Types 导入
  { pattern: /^\.\.?\/.*\/types\/(.+)$/, replacement: '@/types/$1' },
  { pattern: /^\.\.?\/.*\/lib\/types$/, replacement: '@/lib/types' },
  
  // Styles 导入
  { pattern: /^\.\.?\/.*\/styles\/(.+)$/, replacement: '@/styles/$1' },
  { pattern: /^\.\/globals\.css$/, replacement: '@/styles/globals.css' },
]

class ImportFixer {
  private project: Project
  private stats = {
    filesProcessed: 0,
    importsFixed: 0,
    errors: 0
  }

  constructor() {
    this.project = new Project({
      tsConfigFilePath: './tsconfig.json',
      skipAddingFilesFromTsConfig: true
    })
  }

  async fixImports() {
    console.log('🔧 开始修复导入路径...')
    
    // 添加所有 TypeScript/TSX 文件
    this.project.addSourceFilesAtPaths('src/**/*.{ts,tsx}')
    
    const sourceFiles = this.project.getSourceFiles()
    console.log(`📁 找到 ${sourceFiles.length} 个文件`)

    for (const sourceFile of sourceFiles) {
      try {
        this.fixFileImports(sourceFile)
        this.stats.filesProcessed++
      } catch (error) {
        console.error(`❌ 处理文件 ${sourceFile.getFilePath()} 时出错:`, error)
        this.stats.errors++
      }
    }

    // 保存所有更改
    await this.project.save()
    
    this.printStats()
  }

  private fixFileImports(sourceFile: any) {
    const filePath = sourceFile.getFilePath()
    const importDeclarations = sourceFile.getImportDeclarations()
    
    let fileImportsFixed = 0

    importDeclarations.forEach((importDecl: any) => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue()
      const newModuleSpecifier = this.mapImportPath(moduleSpecifier, filePath)
      
      if (newModuleSpecifier && newModuleSpecifier !== moduleSpecifier) {
        importDecl.setModuleSpecifier(newModuleSpecifier)
        fileImportsFixed++
        this.stats.importsFixed++
      }
    })

    if (fileImportsFixed > 0) {
      console.log(`  ✅ ${path.relative(process.cwd(), filePath)}: ${fileImportsFixed} 个导入已修复`)
    }
  }

  private mapImportPath(originalPath: string, currentFilePath: string): string | null {
    // 跳过外部包导入
    if (!originalPath.startsWith('.') && !originalPath.startsWith('@/')) {
      return null
    }

    // 如果已经是别名导入，检查是否需要更新
    if (originalPath.startsWith('@/')) {
      for (const mapping of importMappings) {
        if (mapping.pattern.test(originalPath)) {
          return originalPath.replace(mapping.pattern, mapping.replacement)
        }
      }
      return null
    }

    // 处理相对路径导入
    const resolvedPath = path.resolve(path.dirname(currentFilePath), originalPath)
    const relativePath = path.relative(process.cwd(), resolvedPath)

    // 规范化路径分隔符
    const normalizedPath = relativePath.replace(/\\/g, '/')

    // 应用导入映射
    for (const mapping of importMappings) {
      if (mapping.pattern.test(normalizedPath)) {
        return normalizedPath.replace(mapping.pattern, mapping.replacement)
      }
    }

    // 处理一些特殊情况
    if (normalizedPath.includes('src/components/')) {
      return normalizedPath.replace(/.*src\/components\/(.+)$/, '@/components/$1')
    }
    
    if (normalizedPath.includes('src/lib/')) {
      return normalizedPath.replace(/.*src\/lib\/(.+)$/, '@/lib/$1')
    }

    if (normalizedPath.includes('src/hooks/')) {
      return normalizedPath.replace(/.*src\/hooks\/(.+)$/, '@/hooks/$1')
    }

    return null
  }

  private printStats() {
    console.log('\n📊 修复统计:')
    console.log(`  📁 处理文件: ${this.stats.filesProcessed}`)
    console.log(`  🔧 修复导入: ${this.stats.importsFixed}`)
    console.log(`  ❌ 错误数量: ${this.stats.errors}`)
    
    if (this.stats.errors === 0) {
      console.log('\n✅ 所有导入路径修复完成!')
    } else {
      console.log('\n⚠️  修复完成，但有一些错误需要手动检查')
    }
  }
}

// 回滚功能
class ImportRollback {
  private project: Project

  constructor() {
    this.project = new Project({
      tsConfigFilePath: './tsconfig.json',
      skipAddingFilesFromTsConfig: true
    })
  }

  async rollback() {
    console.log('🔄 开始回滚导入路径...')
    
    this.project.addSourceFilesAtPaths('src/**/*.{ts,tsx}')
    const sourceFiles = this.project.getSourceFiles()

    for (const sourceFile of sourceFiles) {
      const importDeclarations = sourceFile.getImportDeclarations()
      
      importDeclarations.forEach((importDecl: any) => {
        const moduleSpecifier = importDecl.getModuleSpecifierValue()
        
        // 将别名导入转换回相对路径 (简化版)
        if (moduleSpecifier.startsWith('@/')) {
          const relativePath = this.convertAliasToRelative(moduleSpecifier, sourceFile.getFilePath())
          if (relativePath) {
            importDecl.setModuleSpecifier(relativePath)
          }
        }
      })
    }

    await this.project.save()
    console.log('✅ 回滚完成!')
  }

  private convertAliasToRelative(aliasPath: string, currentFilePath: string): string | null {
    // 这里实现别名到相对路径的转换逻辑
    // 简化实现，实际使用中可能需要更复杂的逻辑
    const srcPath = aliasPath.replace('@/', 'src/')
    const currentDir = path.dirname(currentFilePath)
    const targetPath = path.resolve(process.cwd(), srcPath)
    
    return path.relative(currentDir, targetPath).replace(/\\/g, '/')
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--rollback')) {
    const rollback = new ImportRollback()
    await rollback.rollback()
  } else {
    const fixer = new ImportFixer()
    await fixer.fixImports()
  }
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error)
}

export { ImportFixer, ImportRollback }

