<template>
  <div class="upload-music-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>上传音乐</h1>
      <p>分享你的音乐作品，让更多人听到你的声音</p>
    </div>

    <!-- 上传区域 -->
    <div class="upload-section">
      <!-- 文件选择区域 -->
      <div
        class="upload-area"
        :class="{ 'is-dragover': isDragOver, 'has-file': selectedFile }"
        @click="handleSelectFile"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
      >
        <div v-if="!selectedFile" class="upload-placeholder">
          <div class="upload-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <h3>选择音乐文件</h3>
          <p>支持 MP3、WAV、FLAC 格式，最大 50MB</p>
          <p class="drag-tip">拖拽文件到此处或点击选择</p>
        </div>

        <div v-else class="file-info">
          <div class="file-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon
                points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"
              ></polygon>
            </svg>
          </div>
          <div class="file-details">
            <h4>{{ selectedFile.name }}</h4>
            <p>{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button @click.stop="removeFile" class="remove-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- 上传进度 -->
      <div v-if="isUploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p>上传中... {{ uploadProgress }}%</p>
      </div>
    </div>

    <!-- 歌曲信息表单 -->
    <div v-if="selectedFile && !isUploading" class="song-form">
      <h2>歌曲信息</h2>

      <div class="form-group">
        <label>歌曲名称 *</label>
        <input
          v-model="songInfo.title"
          type="text"
          placeholder="请输入歌曲名称"
          :class="{ error: errors.title }"
        />
        <span v-if="errors.title" class="error-text">{{ errors.title }}</span>
      </div>

      <div class="form-group">
        <label>艺术家 *</label>
        <input
          v-model="songInfo.artist"
          type="text"
          placeholder="请输入艺术家名称"
          :class="{ error: errors.artist }"
        />
        <span v-if="errors.artist" class="error-text">{{ errors.artist }}</span>
      </div>

      <div class="form-group">
        <label>专辑</label>
        <input v-model="songInfo.album" type="text" placeholder="请输入专辑名称（可选）" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>流派</label>
          <select v-model="songInfo.genre">
            <option value="">选择流派</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.name">
              {{ genre.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>发行年份</label>
          <input
            v-model="songInfo.year"
            type="number"
            placeholder="年份"
            min="1900"
            :max="currentYear"
          />
        </div>
      </div>

      <div class="form-group">
        <label>描述</label>
        <textarea
          v-model="songInfo.description"
          placeholder="介绍一下这首歌曲..."
          rows="3"
        ></textarea>
      </div>

      <!-- 封面上传 -->
      <div class="form-group">
        <label>封面图片</label>
        <div class="cover-upload">
          <div
            class="cover-preview"
            :class="{ 'has-cover': coverPreview }"
            @click="handleSelectCover"
          >
            <img v-if="coverPreview" :src="coverPreview" alt="封面预览" />
            <div v-else class="cover-placeholder">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21,15 16,10 5,21"></polyline>
              </svg>
              <span>选择封面</span>
            </div>
          </div>
          <p class="cover-tip">建议尺寸 300x300，支持 JPG、PNG 格式</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button @click="handleCancel" class="btn-secondary">取消</button>
        <button @click="handleUpload" class="btn-primary" :disabled="!canUpload">上传歌曲</button>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="audio/*"
      style="display: none"
      @change="handleFileSelect"
    />

    <input
      ref="coverInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleCoverSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { uploadApi } from '@/services'
import { genreApi } from '@/services'
import type { Genre } from '@/types'

// 路由
const router = useRouter()

// 响应式数据
const selectedFile = ref<File | null>(null)
const selectedCover = ref<File | null>(null)
const coverPreview = ref<string>('')
const isUploading = ref(false)
const uploadProgress = ref(0)
const isDragOver = ref(false)
const genres = ref<Genre[]>([])

// 歌曲信息
const songInfo = reactive({
  title: '',
  artist: '',
  album: '',
  genre: '',
  year: '',
  description: '',
})

// 表单验证错误
const errors = reactive({
  title: '',
  artist: '',
})

// 计算属性
const currentYear = computed(() => new Date().getFullYear())

const canUpload = computed(() => {
  return selectedFile.value && songInfo.title.trim() && songInfo.artist.trim() && !isUploading.value
})

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 文件选择处理
const handleSelectFile = () => {
  if (isUploading.value) return
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const validateAndSetFile = (file: File) => {
  // 验证文件类型
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg']
  if (!allowedTypes.includes(file.type)) {
    alert('不支持的文件格式，请选择 MP3、WAV、FLAC 格式的音频文件')
    return
  }

  // 验证文件大小 (50MB)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    alert('文件大小不能超过 50MB')
    return
  }

  selectedFile.value = file

  // 自动填充歌曲名称（去掉扩展名）
  if (!songInfo.title) {
    songInfo.title = file.name.replace(/\.[^/.]+$/, '')
  }
}

// 拖拽处理
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  if (isUploading.value) return

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

// 移除文件
const removeFile = () => {
  selectedFile.value = null
  songInfo.title = ''
}

// 封面选择
const handleSelectCover = () => {
  coverInput.value?.click()
}

const handleCoverSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedCover.value = file

    // 创建预览
    const reader = new FileReader()
    reader.onload = e => {
      coverPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 表单验证
const validateForm = (): boolean => {
  errors.title = ''
  errors.artist = ''

  if (!songInfo.title.trim()) {
    errors.title = '请输入歌曲名称'
  }

  if (!songInfo.artist.trim()) {
    errors.artist = '请输入艺术家名称'
  }

  return !errors.title && !errors.artist
}

// 上传处理
const handleUpload = async () => {
  if (!selectedFile.value || !validateForm()) return

  try {
    isUploading.value = true
    uploadProgress.value = 0

    // 先上传封面（如果有）
    let coverUrl = ''
    if (selectedCover.value) {
      const coverResult = await uploadApi.uploadCover(selectedCover.value, progress => {
        uploadProgress.value = Math.floor(progress * 0.3) // 封面上传占30%进度
      })
      coverUrl = coverResult.url
    }

    // 上传音乐文件
    const musicResult = await uploadApi.uploadMusic(selectedFile.value, progress => {
      uploadProgress.value = 30 + Math.floor(progress * 0.7) // 音乐上传占70%进度
    })

    // TODO: 调用创建歌曲的API，保存歌曲信息到数据库
    // const songData = {
    //   title: songInfo.title,
    //   artist: songInfo.artist,
    //   album: songInfo.album,
    //   genre: songInfo.genre,
    //   year: songInfo.year ? parseInt(songInfo.year) : undefined,
    //   description: songInfo.description,
    //   audioUrl: musicResult.url,
    //   coverUrl: coverUrl || undefined
    // }
    // await musicApi.createSong(songData)

    uploadProgress.value = 100

    // 显示成功消息
    alert('歌曲上传成功！')

    // 跳转到歌曲管理页面
    router.push('/my-music')
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// 取消上传
const handleCancel = () => {
  router.back()
}

// 加载流派列表
const loadGenres = async () => {
  try {
    genres.value = await genreApi.getGenres()
  } catch (error) {
    console.error('加载流派失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadGenres()
})

// 模板引用
const fileInput = ref<HTMLInputElement>()
const coverInput = ref<HTMLInputElement>()
</script>

<style scoped>
.upload-music-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.page-header p {
  color: #666;
  font-size: 1rem;
}

.upload-section {
  margin-bottom: 40px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.upload-area.is-dragover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-area.has-file {
  border-color: #10b981;
  background: #f0fdf4;
  padding: 20px;
}

.upload-placeholder .upload-icon {
  color: #9ca3af;
  margin-bottom: 16px;
}

.upload-placeholder h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.upload-placeholder p {
  color: #6b7280;
  margin-bottom: 4px;
}

.drag-tip {
  font-size: 0.875rem;
  color: #9ca3af;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-icon {
  color: #10b981;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-details h4 {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.file-details p {
  color: #6b7280;
  font-size: 0.875rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #fef2f2;
}

.upload-progress {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.upload-progress p {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.song-form {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.song-form h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}

.cover-upload {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.cover-preview {
  width: 120px;
  height: 120px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  overflow: hidden;
}

.cover-preview:hover {
  border-color: #3b82f6;
}

.cover-preview.has-cover {
  border-style: solid;
  border-color: #10b981;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
}

.cover-placeholder span {
  font-size: 0.875rem;
}

.cover-tip {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .upload-music-view {
    padding: 16px;
  }

  .song-form {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .cover-upload {
    flex-direction: column;
  }
}
</style>
