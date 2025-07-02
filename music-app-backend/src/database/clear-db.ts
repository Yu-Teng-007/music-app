/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const dataSource = app.get(DataSource)

  try {
    console.log('🗑️  开始清理数据库...')

    // 禁用外键约束
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0')

    // 获取所有表名
    const result = await dataSource.query(`
      SELECT table_name as tableName
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `)

    if (result.length === 0) {
      console.log('📭 数据库中没有表需要清理')
      return
    }

    console.log(`🔍 发现 ${result.length} 个表:`)
    result.forEach((table: any) => console.log(`  - ${table.tableName}`))

    // 删除所有表
    for (const table of result) {
      console.log(`🗑️  删除表: ${table.tableName}`)
      await dataSource.query(`DROP TABLE IF EXISTS \`${table.tableName}\``)
    }

    // 重新启用外键约束
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1')

    console.log('✅ 数据库清理完成！')
  } catch (error) {
    console.error('❌ 数据库清理失败:', error)
  } finally {
    await app.close()
  }
}

void bootstrap()
