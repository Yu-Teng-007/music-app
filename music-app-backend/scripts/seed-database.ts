import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { seedAdminUser } from './seed-admin-user'
import { seedGenres } from './seed-genres'
import { seedRecommendedSongs } from './seed-recommended-songs'
import { seedPlaylists } from './seed-playlists'

interface SeedOptions {
  environment: 'development' | 'production'
  force: boolean // 是否强制重新创建数据
  skipExisting: boolean // 是否跳过已存在的数据
}

const DEFAULT_OPTIONS: SeedOptions = {
  environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  force: false,
  skipExisting: true,
}

async function runSeeder(name: string, seederFunction: () => Promise<void>) {
  console.log(`\n🌱 开始运行种子文件: ${name}`)
  console.log('=' .repeat(50))
  
  try {
    await seederFunction()
    console.log(`✅ ${name} 完成`)
  } catch (error) {
    console.error(`❌ ${name} 失败:`, error.message)
    throw error
  }
}

async function seedDatabase(options: Partial<SeedOptions> = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  console.log('🚀 开始数据库种子文件初始化')
  console.log(`📍 环境: ${config.environment}`)
  console.log(`🔄 强制重新创建: ${config.force ? '是' : '否'}`)
  console.log(`⏭️  跳过已存在数据: ${config.skipExisting ? '是' : '否'}`)
  console.log('=' .repeat(60))

  try {
    // 1. 创建管理员用户
    await runSeeder('管理员用户', async () => {
      const { seedAdminUser } = await import('./seed-admin-user')
      await seedAdminUser()
    })

    // 2. 创建音乐分类
    await runSeeder('音乐分类', async () => {
      const { seedGenres } = await import('./seed-genres')
      await seedGenres()
    })

    // 3. 创建推荐歌曲
    await runSeeder('推荐歌曲', async () => {
      const { seedRecommendedSongs } = await import('./seed-recommended-songs')
      await seedRecommendedSongs()
    })

    // 4. 创建默认播放列表
    await runSeeder('默认播放列表', async () => {
      const { seedPlaylists } = await import('./seed-playlists')
      await seedPlaylists()
    })

    console.log('\n🎉 所有种子文件运行完成！')
    console.log('=' .repeat(60))
    console.log('📊 数据库初始化摘要:')
    console.log('  ✅ 管理员用户已创建')
    console.log('  ✅ 音乐分类已添加')
    console.log('  ✅ 推荐歌曲已导入')
    console.log('  ✅ 默认播放列表已创建')
    console.log('\n🔐 管理员登录信息:')
    console.log(`  📧 邮箱: admin@musicapp.com`)
    console.log(`  👤 用户名: admin`)
    console.log(`  🔑 密码: ${config.environment === 'production' ? 'MusicApp@Admin2024!' : 'admin123456'}`)
    console.log('\n⚠️  重要提醒:')
    console.log('  - 生产环境请及时修改默认管理员密码')
    console.log('  - 建议定期备份数据库')
    console.log('  - 确保上传目录权限正确设置')

  } catch (error) {
    console.error('\n💥 种子文件运行失败:', error.message)
    console.error('请检查数据库连接和配置是否正确')
    process.exit(1)
  }
}

// 命令行参数解析
function parseArguments(): Partial<SeedOptions> {
  const args = process.argv.slice(2)
  const options: Partial<SeedOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--env':
      case '--environment':
        const env = args[i + 1]
        if (env === 'development' || env === 'production') {
          options.environment = env
        }
        i++
        break
      
      case '--force':
        options.force = true
        break
      
      case '--no-skip':
        options.skipExisting = false
        break
      
      case '--help':
      case '-h':
        console.log(`
数据库种子文件运行工具

用法: npm run seed [选项]

选项:
  --env, --environment <env>  指定环境 (development|production)
  --force                     强制重新创建所有数据
  --no-skip                   不跳过已存在的数据
  --help, -h                  显示帮助信息

示例:
  npm run seed                           # 使用默认设置运行
  npm run seed -- --env production      # 在生产环境运行
  npm run seed -- --force               # 强制重新创建数据
        `)
        process.exit(0)
    }
  }

  return options
}

// 运行脚本
if (require.main === module) {
  const options = parseArguments()
  seedDatabase(options).catch(console.error)
}

export { seedDatabase }
