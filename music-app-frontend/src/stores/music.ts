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
  }

  function pause() {
    isPlaying.value = false
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value
  }

  function setCurrentSong(song: Song) {
    currentSong.value = song
    const index = playlist.value.findIndex(s => s.id === song.id)
    if (index !== -1) {
      currentIndex.value = index
    }
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
      return response.data || []
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
      return response.data || []
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
      return response.data || []
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
      return response.data || []
    } catch (err: any) {
      error.value = err.message || '搜索歌曲失败'
      console.error('Failed to search songs:', err)
      return []
    } finally {
      isLoading.value = false
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

  return {
    // 状态
    currentSong,
    playlist,
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
  }
})
