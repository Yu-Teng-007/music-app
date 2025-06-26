<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h3>创建新歌单</h3>
        <button @click="$emit('close')" class="close-btn">
          <X :size="20" />
        </button>
      </div>

      <!-- 歌单封面选择 -->
      <div class="cover-section">
        <div class="cover-preview">
          <img :src="selectedCover || defaultCover" alt="歌单封面" class="cover-image" />
          <div class="cover-overlay">
            <Camera :size="24" />
            <span>选择封面</span>
          </div>
        </div>
        <div class="cover-options">
          <button
            v-for="cover in coverOptions"
            :key="cover.id"
            @click="selectedCover = cover.url"
            class="cover-option"
            :class="{ active: selectedCover === cover.url }"
          >
            <img :src="cover.url" :alt="`封面 ${cover.id}`" />
          </button>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="form-section">
        <div class="form-group">
          <label>歌单名称</label>
          <input
            type="text"
            v-model="playlistName"
            placeholder="给你的歌单起个好听的名字"
            @keyup.enter="createPlaylist"
            class="playlist-name-input"
            maxlength="50"
          />
          <div class="input-counter">{{ playlistName.length }}/50</div>
        </div>

        <div class="form-group">
          <label>歌单描述 <span class="optional">(可选)</span></label>
          <textarea
            v-model="playlistDescription"
            placeholder="介绍一下这个歌单的特色..."
            class="playlist-description-input"
            maxlength="200"
            rows="3"
          ></textarea>
          <div class="input-counter">{{ playlistDescription.length }}/200</div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isPrivate" class="checkbox-input" />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">设为私密歌单</span>
          </label>
          <div class="checkbox-desc">
            <span>私密歌单只有你可以看到</span>
          </div>
        </div>
      </div>

      <!-- 模态框底部 -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-btn">取消</button>
        <button
          @click="createPlaylist"
          class="confirm-btn"
          :disabled="!playlistName.trim() || isCreating"
        >
          {{ isCreating ? '创建中...' : '创建歌单' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, Camera } from 'lucide-vue-next'

const props = defineProps({
  isCreating: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'create'])

// 表单数据
const playlistName = ref('')
const playlistDescription = ref('')
const isPrivate = ref(false)
const selectedCover = ref('')

// 默认封面
const defaultCover = 'https://picsum.photos/300/300?random=200'

// 封面选项
const coverOptions = [
  { id: 1, url: 'https://picsum.photos/300/300?random=201' },
  { id: 2, url: 'https://picsum.photos/300/300?random=202' },
  { id: 3, url: 'https://picsum.photos/300/300?random=203' },
  { id: 4, url: 'https://picsum.photos/300/300?random=204' },
  { id: 5, url: 'https://picsum.photos/300/300?random=205' },
  { id: 6, url: 'https://picsum.photos/300/300?random=206' },
]

// 创建歌单
const createPlaylist = () => {
  if (!playlistName.value.trim()) return

  emit('create', {
    name: playlistName.value.trim(),
    description: playlistDescription.value.trim(),
    isPrivate: isPrivate.value,
    coverUrl: selectedCover.value || defaultCover,
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.cover-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-preview {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  cursor: pointer;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cover-overlay span {
  margin-top: 8px;
  font-size: 14px;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.cover-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
}

.cover-option {
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
}

.cover-option img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-option.active {
  border-color: #007aff;
}

.form-section {
  padding: 0 20px 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.optional {
  font-weight: normal;
  color: #999;
  font-size: 14px;
}

.playlist-name-input,
.playlist-description-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border 0.2s ease;
}

.playlist-name-input:focus,
.playlist-description-input:focus {
  border-color: #007aff;
  outline: none;
}

.input-counter {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-input {
  margin-right: 8px;
}

.checkbox-text {
  font-weight: 500;
}

.checkbox-desc {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
  margin-left: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #eee;
  gap: 10px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.confirm-btn {
  background-color: #007aff;
  border: none;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #0062cc;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
