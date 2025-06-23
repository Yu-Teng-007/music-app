#!/usr/bin/env node

/**
 * 环境配置切换脚本
 * 使用方法：
 * npm run env:dev    - 切换到开发环境
 * npm run env:prod   - 切换到生产环境
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const environment = args[0]

if (!environment) {
  console.error('❌ 请指定环境: dev 或 prod')
  console.log('使用方法:')
  console.log('  node scripts/env-setup.js dev   - 开发环境')
  console.log('  node scripts/env-setup.js prod  - 生产环境')
  process.exit(1)
}

const envFiles = {
  dev: '.env.development',
  prod: '.env.production',
}

const sourceFile = envFiles[environment]
const targetFile = '.env'

if (!sourceFile) {
  console.error('❌ 无效的环境参数，请使用 dev 或 prod')
  process.exit(1)
}

const sourcePath = path.join(__dirname, '..', sourceFile)
const targetPath = path.join(__dirname, '..', targetFile)

try {
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ 环境配置文件不存在: ${sourceFile}`)
    process.exit(1)
  }

  // 复制环境配置文件
  fs.copyFileSync(sourcePath, targetPath)

  console.log(`✅ 已切换到${environment === 'dev' ? '开发' : '生产'}环境`)
  console.log(`📁 配置文件: ${sourceFile} -> ${targetFile}`)

  // 显示当前配置摘要
  const envContent = fs.readFileSync(targetPath, 'utf8')
  const nodeEnv = envContent.match(/NODE_ENV=(.+)/)?.[1] || 'unknown'
  const dbName = envContent.match(/DB_DATABASE=(.+)/)?.[1] || 'unknown'
  const port = envContent.match(/PORT=(.+)/)?.[1] || 'unknown'

  console.log('\n📋 当前配置摘要:')
  console.log(`   环境: ${nodeEnv}`)
  console.log(`   端口: ${port}`)
  console.log(`   数据库: ${dbName}`)

  if (environment === 'prod') {
    console.log('\n⚠️  生产环境提醒:')
    console.log('   - 请确保已修改数据库密码')
    console.log('   - 请确保已设置安全的JWT密钥')
    console.log('   - 请确保CORS域名配置正确')
  }
} catch (error) {
  console.error('❌ 切换环境失败:', error.message)
  process.exit(1)
}
