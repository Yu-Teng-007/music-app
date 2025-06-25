/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const dataSource = app.get(DataSource)

  try {
    const entities = dataSource.entityMetadatas

    console.log('开始清空数据库...')

    // 禁用外键约束
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0')

    // 清空所有表
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name)
      await repository.query(`TRUNCATE TABLE ${entity.tableName}`)
      console.log(`已清空表: ${entity.tableName}`)
    }

    // 重新启用外键约束
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1')

    console.log('数据库清空完成！')
  } catch (error) {
    console.error('清空数据库时出错:', error)
  } finally {
    await app.close()
  }
}

void bootstrap()
