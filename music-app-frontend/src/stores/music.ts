import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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

// 默认音乐列表
const defaultSongs: Song[] = [
  {
    id: 'default-1',
    title: '夜曲',
    artist: '周杰伦',
    album: '十一月的萧邦',
    duration: 237, // 3分57秒
    coverUrl: 'https://picsum.photos/300/300?random=201',
    audioUrl: '/music/夜曲.mp3',
  },
]

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
    const index = playlist.value.findIndex((s) => s.id === song.id)
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
  let setProgress: (progress: number) => void = (newProgress: number) => {
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
    if (!playlist.value.find((s) => s.id === song.id)) {
      playlist.value.push(song)
    }
  }

  function removeFromPlaylist(songId: string) {
    const index = playlist.value.findIndex((s) => s.id === songId)
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

  // 初始化默认播放列表
  function initializeDefaultPlaylist() {
    if (playlist.value.length === 0) {
      playlist.value = [...defaultSongs]
    }
  }

  // 获取默认歌曲列表
  function getDefaultSongs() {
    return defaultSongs
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
    initializeDefaultPlaylist,
    getDefaultSongs,
    formatTime,
  }
})
