/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../../src/app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Chart } from '../../../src/entities/chart.entity'
import { Song } from '../../../src/entities/song.entity'
import { Repository } from 'typeorm'

interface ChartData {
  name: string
  type: string
  description: string
  updateFrequency: string
  sortOrder: number
  coverUrl?: string
}

const chartsData: ChartData[] = [
  {
    name: '新歌榜',
    type: 'new',
    description: '最新发布的热门歌曲，每小时更新',
    updateFrequency: '每小时更新',
    sortOrder: 1,
  },
  {
    name: '热歌榜',
    type: 'hot',
    description: '最受欢迎的热门歌曲，根据播放量排序',
    updateFrequency: '每周更新',
    sortOrder: 2,
  },
  {
    name: '飙升榜',
    type: 'trending',
    description: '播放量快速增长的歌曲，实时更新',
    updateFrequency: '实时更新',
    sortOrder: 3,
  },
  {
    name: '原创榜',
    type: 'original',
    description: '优质原创音乐作品推荐',
    updateFrequency: '每日更新',
    sortOrder: 4,
  },
  {
    name: 'K-Pop榜',
    type: 'kpop',
    description: '最热门的韩国流行音乐',
    updateFrequency: '每周更新',
    sortOrder: 5,
  },
  {
    name: '电音榜',
    type: 'electronic',
    description: '最流行的电子音乐作品',
    updateFrequency: '每日更新',
    sortOrder: 6,
  },
  {
    name: '民谣榜',
    type: 'folk',
    description: '最受欢迎的民谣音乐作品',
    updateFrequency: '每周更新',
    sortOrder: 7,
  },
  {
    name: '古风榜',
    type: 'ancient',
    description: '最热门的古风音乐作品',
    updateFrequency: '每日更新',
    sortOrder: 8,
  },
  {
    name: 'MV榜',
    type: 'mv',
    description: '最受欢迎的音乐视频作品',
    updateFrequency: '每日更新',
    sortOrder: 9,
  },
]

async function seedCharts() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const chartRepository = app.get<Repository<Chart>>(getRepositoryToken(Chart))
  const songRepository = app.get<Repository<Song>>(getRepositoryToken(Song))

  console.log('开始创建排行榜数据...')

  try {
    for (const chartData of chartsData) {
      // 检查排行榜是否已存在
      const existingChart = await chartRepository.findOne({
        where: { type: chartData.type },
      })

      if (existingChart) {
        console.log(`排行榜已存在，跳过: ${chartData.name}`)
        continue
      }

      // 生成随机封面图片
      const randomId = Math.floor(Math.random() * 1000) + 30
      const coverUrl = chartData.coverUrl || `https://picsum.photos/400/400?random=${randomId}`

      // 创建排行榜
      const newChart = chartRepository.create({
        name: chartData.name,
        type: chartData.type,
        description: chartData.description,
        updateFrequency: chartData.updateFrequency,
        coverUrl: coverUrl,
        sortOrder: chartData.sortOrder,
        isActive: true,
      })

      const savedChart = await chartRepository.save(newChart)

      // 获取一些歌曲添加到排行榜中
      const songs = await songRepository.find({
        take: 50, // 每个榜单最多50首歌
      })

      if (songs.length > 0) {
        // 根据不同的榜单类型，可以使用不同的排序逻辑
        // 这里简单实现，实际项目中可以根据具体需求调整
        let chartSongs = [...songs]

        switch (chartData.type) {
          case 'new':
            // 按创建时间排序
            chartSongs.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            break
          case 'hot':
            // 随机排序模拟热门
            chartSongs.sort(() => Math.random() - 0.5)
            break
          case 'trending':
            // 另一种随机排序模拟飙升
            chartSongs.sort(() => Math.random() - 0.5)
            break
          default:
            // 默认随机排序
            chartSongs.sort(() => Math.random() - 0.5)
        }

        // 只取前20首
        chartSongs = chartSongs.slice(0, 20)

        // 更新排行榜歌曲
        savedChart.songs = chartSongs
        await chartRepository.save(savedChart)

        console.log(`✅ 成功创建排行榜: ${chartData.name} (包含 ${chartSongs.length} 首歌曲)`)
      } else {
        console.log(`✅ 成功创建排行榜: ${chartData.name} (暂无歌曲)`)
      }
    }

    console.log('🎵 排行榜数据创建完成！')
  } catch (error) {
    console.error('❌ 创建排行榜失败:', error.message)
    throw error
  } finally {
    await app.close()
  }
}

// 运行脚本
if (require.main === module) {
  seedCharts().catch(console.error)
}

export { seedCharts }
