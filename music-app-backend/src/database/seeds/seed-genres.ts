/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../../src/app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Genre } from '../../../src/entities/genre.entity'
import { Repository } from 'typeorm'

interface GenreData {
  name: string
  description: string
  color: string
  icon: string
  sortOrder: number
}

const genresData: GenreData[] = [
  {
    name: '流行',
    description: '当代流行音乐，包含各种流行元素和风格',
    color: '#FF6B6B',
    icon: '🎵',
    sortOrder: 1,
  },
  {
    name: '摇滚',
    description: '摇滚乐及其各种子风格，充满力量和激情',
    color: '#4ECDC4',
    icon: '🎸',
    sortOrder: 2,
  },
  {
    name: '民谣',
    description: '民间音乐和现代民谣，朴实自然的音乐风格',
    color: '#45B7D1',
    icon: '🎻',
    sortOrder: 3,
  },
  {
    name: '电子',
    description: '电子音乐和舞曲，现代科技与音乐的完美结合',
    color: '#96CEB4',
    icon: '🎛️',
    sortOrder: 4,
  },
  {
    name: '古典',
    description: '古典音乐和交响乐，永恒的艺术瑰宝',
    color: '#FFEAA7',
    icon: '🎼',
    sortOrder: 5,
  },
  {
    name: '爵士',
    description: '爵士乐及其衍生风格，自由即兴的音乐艺术',
    color: '#DDA0DD',
    icon: '🎺',
    sortOrder: 6,
  },
  {
    name: '说唱',
    description: 'Hip-Hop和说唱音乐，节奏感强烈的音乐形式',
    color: '#FFB347',
    icon: '🎤',
    sortOrder: 7,
  },
  {
    name: '蓝调',
    description: '蓝调音乐，充满情感和灵魂的音乐风格',
    color: '#87CEEB',
    icon: '🎷',
    sortOrder: 8,
  },
  {
    name: '乡村',
    description: '乡村音乐，来自美国南部的传统音乐风格',
    color: '#F4A460',
    icon: '🤠',
    sortOrder: 9,
  },
  {
    name: '金属',
    description: '重金属音乐，强烈的节奏和激进的音乐风格',
    color: '#696969',
    icon: '⚡',
    sortOrder: 10,
  },
  {
    name: '雷鬼',
    description: '雷鬼音乐，来自牙买加的独特音乐风格',
    color: '#32CD32',
    icon: '🌴',
    sortOrder: 11,
  },
  {
    name: '朋克',
    description: '朋克摇滚，反叛精神的音乐表达',
    color: '#FF1493',
    icon: '💀',
    sortOrder: 12,
  },
  {
    name: '新世纪',
    description: 'New Age音乐，冥想和放松的音乐风格',
    color: '#E6E6FA',
    icon: '🌙',
    sortOrder: 13,
  },
  {
    name: '世界音乐',
    description: '来自世界各地的传统和现代音乐',
    color: '#20B2AA',
    icon: '🌍',
    sortOrder: 14,
  },
  {
    name: '轻音乐',
    description: '轻松愉快的背景音乐和器乐',
    color: '#FFE4E1',
    icon: '🎹',
    sortOrder: 15,
  },
  {
    name: '古风',
    description: '中国风和古风音乐，融合传统文化元素的现代音乐',
    color: '#CD853F',
    icon: '🏮',
    sortOrder: 16,
  },
]

async function seedGenres() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const genreRepository = app.get<Repository<Genre>>(getRepositoryToken(Genre))

  console.log('开始添加音乐分类数据...')

  try {
    for (const genreData of genresData) {
      // 检查分类是否已存在
      const existingGenre = await genreRepository.findOne({
        where: { name: genreData.name },
      })

      if (existingGenre) {
        console.log(`分类已存在，跳过: ${genreData.name}`)
        continue
      }

      // 创建新分类
      const newGenre = genreRepository.create({
        name: genreData.name,
        description: genreData.description,
        color: genreData.color,
        icon: genreData.icon,
        sortOrder: genreData.sortOrder,
        isActive: true,
      })

      await genreRepository.save(newGenre)
      console.log(`✅ 成功添加分类: ${genreData.name}`)
    }

    console.log('🎵 音乐分类数据添加完成！')
  } catch (error) {
    console.error('❌ 添加音乐分类失败:', error.message)
    throw error
  } finally {
    await app.close()
  }
}

// 运行脚本
if (require.main === module) {
  seedGenres().catch(console.error)
}

export { seedGenres }
