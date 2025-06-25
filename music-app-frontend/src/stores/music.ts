import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { musicApi } from '@/services/music-api'

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl: string
  genre?: string
  playCount?: number
  createdAt?: string
  rankChange?: number
}

export interface PlayHistoryItem {
  id: string
  song: Song
  playedAt: string
  playDuration: number // 播放时长（秒）
}

export interface PlayMode {
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
}

export const useMusicStore = defineStore('music', () => {
  // 当前播放的歌曲
  const currentSong = ref<Song | null>(null)

  // 播放列表
  const playlist = ref<Song[]>([])

  // 播放历史
  const playHistory = ref<PlayHistoryItem[]>([])

  // 播放状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)

  // 播放模式
  const playMode = ref<PlayMode>({
    shuffle: false,
    repeat: 'none',
  })

  // 当前歌曲在播放列表中的索引
  const currentIndex = ref(0)

  // 播放开始时间（用于计算播放时长）
  const playStartTime = ref<number | null>(null)

  // 加载状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const progress = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  })

  const formattedCurrentTime = computed(() => {
    return formatTime(currentTime.value)
  })

  const formattedDuration = computed(() => {
    return formatTime(duration.value)
  })

  // 工具函数
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 播放控制
  function play() {
    isPlaying.value = true
    // 记录播放开始时间
    if (currentSong.value && !playStartTime.value) {
      playStartTime.value = Date.now()
    }
  }

  function pause() {
    isPlaying.value = false
    // 记录播放历史
    if (currentSong.value && playStartTime.value) {
      const playDuration = Math.floor((Date.now() - playStartTime.value) / 1000)
      if (playDuration >= 30) {
        // 只有播放超过30秒才记录到历史
        addToPlayHistory(currentSong.value, playDuration)
      }
      playStartTime.value = null
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function setCurrentSong(song: Song) {
    // 如果切换歌曲，先记录上一首歌的播放历史
    if (currentSong.value && playStartTime.value) {
      const playDuration = Math.floor((Date.now() - playStartTime.value) / 1000)
      if (playDuration >= 30) {
        addToPlayHistory(currentSong.value, playDuration)
      }
    }

    currentSong.value = song
    const index = playlist.value.findIndex(s => s.id === song.id)
    if (index !== -1) {
      currentIndex.value = index
    }

    // 重置播放开始时间
    playStartTime.value = isPlaying.value ? Date.now() : null
  }

  function nextSong() {
    if (playlist.value.length === 0) return

    let nextIndex = currentIndex.value + 1
    if (nextIndex >= playlist.value.length) {
      nextIndex = playMode.value.repeat === 'all' ? 0 : playlist.value.length - 1
    }

    currentIndex.value = nextIndex
    currentSong.value = playlist.value[nextIndex]
  }

  function previousSong() {
    if (playlist.value.length === 0) return

    let prevIndex = currentIndex.value - 1
    if (prevIndex < 0) {
      prevIndex = playMode.value.repeat === 'all' ? playlist.value.length - 1 : 0
    }

    currentIndex.value = prevIndex
    currentSong.value = playlist.value[prevIndex]
  }

  function setVolume(newVolume: number) {
    volume.value = Math.max(0, Math.min(1, newVolume))
  }

  // setProgress方法将由AudioPlayer组件提供
  const setProgress: (progress: number) => void = (newProgress: number) => {
    currentTime.value = (newProgress / 100) * duration.value
  }

  function toggleShuffle() {
    playMode.value.shuffle = !playMode.value.shuffle
  }

  function toggleRepeat() {
    const modes: PlayMode['repeat'][] = ['none', 'one', 'all']
    const currentModeIndex = modes.indexOf(playMode.value.repeat)
    const nextModeIndex = (currentModeIndex + 1) % modes.length
    playMode.value.repeat = modes[nextModeIndex]
  }

  function addToPlaylist(song: Song) {
    if (!playlist.value.find(s => s.id === song.id)) {
      playlist.value.push(song)
    }
  }

  function removeFromPlaylist(songId: string) {
    const index = playlist.value.findIndex(s => s.id === songId)
    if (index !== -1) {
      playlist.value.splice(index, 1)
      if (index <= currentIndex.value && currentIndex.value > 0) {
        currentIndex.value--
      }
    }
  }

  function setPlaylist(songs: Song[]) {
    playlist.value = songs
    // 不自动设置当前歌曲，让用户主动选择
  }

  // API数据加载方法
  async function loadSongs(params?: any) {
    try {
      isLoading.value = true
      error.value = null
      const response = await musicApi.getSongs(params)
      return response || []
    } catch (err: any) {
      error.value = err.message || '加载歌曲失败'
      console.error('Failed to load songs:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function loadRecommendedSongs(limit?: number) {
    try {
      isLoading.value = true
      error.value = null
      const response = await musicApi.getRecommendedSongs(limit)
      return response || []
    } catch (err: any) {
      error.value = err.message || '加载推荐歌曲失败'
      console.error('Failed to load recommended songs:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function loadPopularSongs(limit?: number) {
    try {
      isLoading.value = true
      error.value = null
      const response = await musicApi.getPopularSongs(limit)
      return response || []
    } catch (err: any) {
      error.value = err.message || '加载热门歌曲失败'
      console.error('Failed to load popular songs:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function searchSongs(keyword: string, limit?: number) {
    try {
      isLoading.value = true
      error.value = null
      const response = await musicApi.searchSongs(keyword, limit)
      return response || []
    } catch (err: any) {
      error.value = err.message || '搜索歌曲失败'
      console.error('Failed to search songs:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 播放历史管理
  function addToPlayHistory(song: Song, playDuration: number) {
    const historyItem: PlayHistoryItem = {
      id: `${song.id}-${Date.now()}`,
      song,
      playedAt: new Date().toISOString(),
      playDuration,
    }

    // 检查是否已存在相同歌曲的最近记录（5分钟内）
    const recentIndex = playHistory.value.findIndex(
      item =>
        item.song.id === song.id && Date.now() - new Date(item.playedAt).getTime() < 5 * 60 * 1000
    )

    if (recentIndex !== -1) {
      // 更新现有记录的播放时长
      playHistory.value[recentIndex].playDuration += playDuration
      playHistory.value[recentIndex].playedAt = new Date().toISOString()
    } else {
      // 添加新记录到开头
      playHistory.value.unshift(historyItem)
      // 限制历史记录数量（最多保留1000条）
      if (playHistory.value.length > 1000) {
        playHistory.value = playHistory.value.slice(0, 1000)
      }
    }

    // 保存到本地存储
    savePlayHistoryToStorage()
  }

  function removeFromPlayHistory(historyId: string) {
    const index = playHistory.value.findIndex(item => item.id === historyId)
    if (index !== -1) {
      playHistory.value.splice(index, 1)
      savePlayHistoryToStorage()
    }
  }

  function clearPlayHistory() {
    playHistory.value = []
    savePlayHistoryToStorage()
  }

  function getPlayHistory(limit?: number) {
    return limit ? playHistory.value.slice(0, limit) : playHistory.value
  }

  function savePlayHistoryToStorage() {
    try {
      localStorage.setItem('music_play_history', JSON.stringify(playHistory.value))
    } catch (error) {
      console.error('Failed to save play history to storage:', error)
    }
  }

  function loadPlayHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('music_play_history')
      if (stored) {
        playHistory.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load play history from storage:', error)
      playHistory.value = []
    }
  }

  // 初始化播放列表（从API加载）
  async function initializePlaylist() {
    if (playlist.value.length === 0) {
      const songs = await loadRecommendedSongs(10)
      if (songs.length > 0) {
        playlist.value = songs
      }
    }
  }

  // 初始化播放历史
  function initializePlayHistory() {
    loadPlayHistoryFromStorage()
  }

  // 初始化播放历史
  initializePlayHistory()

  return {
    // 状态
    currentSong,
    playlist,
    playHistory,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    currentIndex,
    isLoading,
    error,

    // 计算属性
    progress,
    formattedCurrentTime,
    formattedDuration,

    // 方法
    play,
    pause,
    togglePlay,
    setCurrentSong,
    nextSong,
    previousSong,
    setVolume,
    setProgress,
    toggleShuffle,
    toggleRepeat,
    addToPlaylist,
    removeFromPlaylist,
    setPlaylist,
    initializePlaylist,
    loadSongs,
    loadRecommendedSongs,
    loadPopularSongs,
    searchSongs,
    formatTime,

    // 播放历史方法
    addToPlayHistory,
    removeFromPlayHistory,
    clearPlayHistory,
    getPlayHistory,
    initializePlayHistory,
  }
})
