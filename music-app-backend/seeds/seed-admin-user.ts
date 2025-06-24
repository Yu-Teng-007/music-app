/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../src/entities/user.entity'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'

interface AdminUserData {
  phone: string | null
  username: string
  password: string
  avatar?: string
}

// 开发环境管理员账号
const developmentAdmin: AdminUserData = {
  phone: null,
  username: 'admin',
  password: 'admin123456', // 开发环境使用简单密码
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
}

// 生产环境管理员账号（使用更安全的密码）
const productionAdmin: AdminUserData = {
  phone: null,
  username: 'admin',
  password: 'MusicApp@Admin2024!', // 生产环境使用复杂密码
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
}

async function seedAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User))

  console.log('开始创建管理员账号...')

  try {
    // 根据环境选择管理员数据
    const isProduction = process.env.NODE_ENV === 'production'
    const adminData = isProduction ? productionAdmin : developmentAdmin

    console.log(`当前环境: ${isProduction ? '生产环境' : '开发环境'}`)

    // 检查管理员是否已存在
    const existingAdmin = await userRepository.findOne({
      where: { username: adminData.username },
    })

    if (existingAdmin) {
      console.log('管理员账号已存在，跳过创建')
      await app.close()
      return
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    // 创建管理员用户
    const adminUser = userRepository.create({
      phone: adminData.phone,
      username: adminData.username,
      password: hashedPassword,
      avatar: adminData.avatar,
      isActive: true,
    })

    await userRepository.save(adminUser)

    console.log('✅ 管理员账号创建成功！')
    console.log('👤 用户名:', adminData.username)
    console.log('🔑 密码:', adminData.password)
    console.log('⚠️  请在生产环境中及时修改默认密码！')
  } catch (error) {
    console.error('❌ 创建管理员账号失败:', error.message)
    throw error
  } finally {
    await app.close()
  }
}

// 运行脚本
if (require.main === module) {
  seedAdminUser().catch(console.error)
}

export { seedAdminUser }
