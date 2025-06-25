/* eslint-disable no-console */
import { DataSource } from 'typeorm'
import { Genre } from '../../entities/genre.entity'

export async function seedGenres(dataSource: DataSource) {
  const genreRepository = dataSource.getRepository(Genre)

  // 检查是否已有分类数据
  const existingCount = await genreRepository.count()
  if (existingCount > 0) {
    return
  }

  const genres = [
    {
      name: '流行',
      description: '流行音乐，包含当下最受欢迎的歌曲',
      color: '#FF6B6B',
      icon: '🎵',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: '摇滚',
      description: '摇滚音乐，充满力量与激情',
      color: '#4ECDC4',
      icon: '🎸',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: '民谣',
      description: '民谣音乐，温暖治愈的声音',
      color: '#45B7D1',
      icon: '🎤',
      isActive: true,
      sortOrder: 3,
    },
    {
      name: '电子',
      description: '电子音乐，科技感十足的节拍',
      color: '#96CEB4',
      icon: '🎧',
      isActive: true,
      sortOrder: 4,
    },
    {
      name: '古典',
      description: '古典音乐，永恒的艺术瑰宝',
      color: '#FFEAA7',
      icon: '🎼',
      isActive: true,
      sortOrder: 5,
    },
    {
      name: '爵士',
      description: '爵士音乐，自由即兴的灵魂',
      color: '#DDA0DD',
      icon: '🎺',
      isActive: true,
      sortOrder: 6,
    },
    {
      name: '说唱',
      description: '说唱音乐，节奏与韵律的碰撞',
      color: '#FFB347',
      icon: '🎤',
      isActive: true,
      sortOrder: 7,
    },
    {
      name: '乡村',
      description: '乡村音乐，朴实真挚的情感',
      color: '#98D8C8',
      icon: '🤠',
      isActive: true,
      sortOrder: 8,
    },
    {
      name: '蓝调',
      description: '蓝调音乐，深沉忧郁的美感',
      color: '#6C5CE7',
      icon: '🎷',
      isActive: true,
      sortOrder: 9,
    },
    {
      name: '雷鬼',
      description: '雷鬼音乐，来自加勒比海的节拍',
      color: '#00B894',
      icon: '🌴',
      isActive: true,
      sortOrder: 10,
    },
    {
      name: '金属',
      description: '金属音乐，极致的力量与速度',
      color: '#2D3436',
      icon: '⚡',
      isActive: true,
      sortOrder: 11,
    },
    {
      name: '朋克',
      description: '朋克音乐，反叛与自由的声音',
      color: '#E17055',
      icon: '💀',
      isActive: true,
      sortOrder: 12,
    },
    {
      name: '放松',
      description: '轻松舒缓的音乐，适合休息时光',
      color: '#A8E6CF',
      icon: '🌸',
      isActive: true,
      sortOrder: 13,
    },
    {
      name: '运动',
      description: '充满活力的音乐，适合运动健身',
      color: '#FF8A80',
      icon: '💪',
      isActive: true,
      sortOrder: 14,
    },
    {
      name: '学习',
      description: '专注学习的背景音乐',
      color: '#81C784',
      icon: '📚',
      isActive: true,
      sortOrder: 15,
    },
    {
      name: '睡眠',
      description: '助眠音乐，帮助放松入睡',
      color: '#9FA8DA',
      icon: '🌙',
      isActive: true,
      sortOrder: 16,
    },
  ]

  try {
    for (const genreData of genres) {
      const genre = genreRepository.create(genreData)
      await genreRepository.save(genre)
    }
    console.log(`成功创建 ${genres.length} 个分类`)
  } catch (error) {
    console.error('创建分类失败:', error)
    throw error
  }
}
