import { ref } from 'vue'
import type { Song } from '@/stores/music'

/**
 * 音频服务 - 负责处理所有与音频播放相关的底层操作
 * 将音频播放逻辑从组件中抽离，实现关注点分离
 */
class AudioService {
  private audio: HTMLAudioElement
  private currentSongId: string | null = null

  // 事件回调
  private onTimeUpdateCallback: ((currentTime: number) => void) | null = null
  private onDurationChangeCallback: ((duration: number) => void) | null = null
  private onEndedCallback: (() => void) | null = null
  private onErrorCallback: ((error: Event) => void) | null = null
  private onPlayCallback: (() => void) | null = null
  private onPauseCallback: (() => void) | null = null

  constructor() {
    this.audio = new Audio()
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audio.currentTime)
      }
    })

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onDurationChangeCallback) {
        this.onDurationChangeCallback(this.audio.duration || 0)
      }
    })

    this.audio.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback()
      }
    })

    this.audio.addEventListener('error', error => {
      if (this.onErrorCallback) {
        this.onErrorCallback(error)
      }
    })

    this.audio.addEventListener('play', () => {
      if (this.onPlayCallback) {
        this.onPlayCallback()
      }
    })

    this.audio.addEventListener('pause', () => {
      if (this.onPauseCallback) {
        this.onPauseCallback()
      }
    })
  }

  // 加载歌曲
  loadSong(song: Song): void {
    if (!song) return

    const isSameSong = this.currentSongId === song.id

    // 更新音频源
    this.audio.src = song.audioUrl
    this.currentSongId = song.id

    // 如果是同一首歌，重置播放位置
    if (isSameSong) {
      this.audio.currentTime = 0
    }
  }

  // 播放控制
  play(): Promise<void> {
    return this.audio.play().catch(error => {
      console.error('播放失败:', error)
      throw error
    })
  }

  pause(): void {
    this.audio.pause()
  }

  stop(): void {
    this.audio.pause()
    this.audio.currentTime = 0
  }

  // 设置进度
  setCurrentTime(time: number): void {
    if (time >= 0 && time <= this.audio.duration) {
      this.audio.currentTime = time
    }
  }

  setProgress(progressPercent: number): void {
    if (this.audio.duration) {
      const newTime = (progressPercent / 100) * this.audio.duration
      this.setCurrentTime(newTime)
    }
  }

  // 音量控制
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  // 获取当前状态
  getCurrentTime(): number {
    return this.audio.currentTime
  }

  getDuration(): number {
    return this.audio.duration || 0
  }

  isPlaying(): boolean {
    return !this.audio.paused
  }

  // 事件注册
  onTimeUpdate(callback: (currentTime: number) => void): void {
    this.onTimeUpdateCallback = callback
  }

  onDurationChange(callback: (duration: number) => void): void {
    this.onDurationChangeCallback = callback
  }

  onEnded(callback: () => void): void {
    this.onEndedCallback = callback
  }

  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback
  }

  onPlay(callback: () => void): void {
    this.onPlayCallback = callback
  }

  onPause(callback: () => void): void {
    this.onPauseCallback = callback
  }

  // 清理资源
  destroy(): void {
    this.audio.pause()
    this.audio.src = ''
    this.onTimeUpdateCallback = null
    this.onDurationChangeCallback = null
    this.onEndedCallback = null
    this.onErrorCallback = null
    this.onPlayCallback = null
    this.onPauseCallback = null
  }
}

// 创建单例实例
const audioService = new AudioService()
export default audioService
