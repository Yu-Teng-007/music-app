<template>
  <el-dialog
    v-model="dialogVisible"
    title="发布动态"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="动态类型" prop="type">
        <el-select v-model="form.type" placeholder="选择动态类型" @change="handleTypeChange">
          <el-option label="分享歌曲" value="share_song" />
          <el-option label="分享歌单" value="share_playlist" />
          <el-option label="喜欢歌曲" value="like_song" />
          <el-option label="创建歌单" value="create_playlist" />
          <el-option label="关注用户" value="follow_user" />
        </el-select>
      </el-form-item>

      <el-form-item label="动态内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="分享你的想法..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 选择歌曲 -->
      <el-form-item 
        v-if="form.type === 'share_song' || form.type === 'like_song'" 
        label="选择歌曲" 
        prop="songId"
      >
        <div class="song-selector">
          <el-button @click="showSongSelector = true" type="primary" plain>
            {{ selectedSong ? selectedSong.title : '点击选择歌曲' }}
          </el-button>
          <div v-if="selectedSong" class="selected-item">
            <div class="item-info">
              <div class="item-title">{{ selectedSong.title }}</div>
              <div class="item-subtitle">{{ selectedSong.artist }}</div>
            </div>
            <el-button @click="clearSong" type="text" size="small">
              <i class="el-icon-close"></i>
            </el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 选择歌单 -->
      <el-form-item 
        v-if="form.type === 'share_playlist' || form.type === 'create_playlist'" 
        label="选择歌单" 
        prop="playlistId"
      >
        <div class="playlist-selector">
          <el-button @click="showPlaylistSelector = true" type="primary" plain>
            {{ selectedPlaylist ? selectedPlaylist.title : '点击选择歌单' }}
          </el-button>
          <div v-if="selectedPlaylist" class="selected-item">
            <div class="item-info">
              <div class="item-title">{{ selectedPlaylist.title }}</div>
              <div class="item-subtitle">{{ selectedPlaylist.description }}</div>
            </div>
            <el-button @click="clearPlaylist" type="text" size="small">
              <i class="el-icon-close"></i>
            </el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 选择用户 -->
      <el-form-item 
        v-if="form.type === 'follow_user'" 
        label="选择用户" 
        prop="targetUserId"
      >
        <div class="user-selector">
          <el-button @click="showUserSelector = true" type="primary" plain>
            {{ selectedUser ? selectedUser.username : '点击选择用户' }}
          </el-button>
          <div v-if="selectedUser" class="selected-item">
            <el-avatar :src="selectedUser.avatar" :size="32">
              {{ selectedUser.username?.charAt(0) }}
            </el-avatar>
            <div class="item-info">
              <div class="item-title">{{ selectedUser.username }}</div>
            </div>
            <el-button @click="clearUser" type="text" size="small">
              <i class="el-icon-close"></i>
            </el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="isSubmitting"
        >
          发布
        </el-button>
      </div>
    </template>

    <!-- 歌曲选择器对话框 -->
    <SongSelectorDialog
      v-model="showSongSelector"
      @select="handleSongSelect"
    />

    <!-- 歌单选择器对话框 -->
    <PlaylistSelectorDialog
      v-model="showPlaylistSelector"
      @select="handlePlaylistSelect"
    />

    <!-- 用户选择器对话框 -->
    <UserSelectorDialog
      v-model="showUserSelector"
      @select="handleUserSelect"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useSocialStore } from '@/stores/social'
import { FeedType, type CreateFeedDto } from '@/services/social-api'
import SongSelectorDialog from './SongSelectorDialog.vue'
import PlaylistSelectorDialog from './PlaylistSelectorDialog.vue'
import UserSelectorDialog from './UserSelectorDialog.vue'
import type { Song } from '@/types/song'
import type { Playlist } from '@/types/playlist'
import type { User } from '@/types/user'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', feed: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const socialStore = useSocialStore()
const formRef = ref<FormInstance>()

// 响应式数据
const isSubmitting = ref(false)
const showSongSelector = ref(false)
const showPlaylistSelector = ref(false)
const showUserSelector = ref(false)

const selectedSong = ref<Song | null>(null)
const selectedPlaylist = ref<Playlist | null>(null)
const selectedUser = ref<User | null>(null)

const form = reactive({
  type: '' as FeedType,
  content: '',
  songId: '',
  playlistId: '',
  targetUserId: '',
})

// 表单验证规则
const rules: FormRules = {
  type: [
    { required: true, message: '请选择动态类型', trigger: 'change' }
  ],
  content: [
    { max: 500, message: '内容不能超过500个字符', trigger: 'blur' }
  ],
  songId: [
    { 
      validator: (rule, value, callback) => {
        if ((form.type === 'share_song' || form.type === 'like_song') && !value) {
          callback(new Error('请选择歌曲'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  playlistId: [
    { 
      validator: (rule, value, callback) => {
        if ((form.type === 'share_playlist' || form.type === 'create_playlist') && !value) {
          callback(new Error('请选择歌单'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  targetUserId: [
    { 
      validator: (rule, value, callback) => {
        if (form.type === 'follow_user' && !value) {
          callback(new Error('请选择用户'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible) {
    resetForm()
  }
})

// 方法
const resetForm = () => {
  form.type = '' as FeedType
  form.content = ''
  form.songId = ''
  form.playlistId = ''
  form.targetUserId = ''
  
  selectedSong.value = null
  selectedPlaylist.value = null
  selectedUser.value = null
  
  formRef.value?.clearValidate()
}

const handleTypeChange = () => {
  // 清除之前选择的内容
  form.songId = ''
  form.playlistId = ''
  form.targetUserId = ''
  
  selectedSong.value = null
  selectedPlaylist.value = null
  selectedUser.value = null
}

const handleSongSelect = (song: Song) => {
  selectedSong.value = song
  form.songId = song.id
  showSongSelector.value = false
}

const handlePlaylistSelect = (playlist: Playlist) => {
  selectedPlaylist.value = playlist
  form.playlistId = playlist.id
  showPlaylistSelector.value = false
}

const handleUserSelect = (user: User) => {
  selectedUser.value = user
  form.targetUserId = user.id
  showUserSelector.value = false
}

const clearSong = () => {
  selectedSong.value = null
  form.songId = ''
}

const clearPlaylist = () => {
  selectedPlaylist.value = null
  form.playlistId = ''
}

const clearUser = () => {
  selectedUser.value = null
  form.targetUserId = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    isSubmitting.value = true
    
    const feedData: CreateFeedDto = {
      type: form.type,
      content: form.content || undefined,
      songId: form.songId || undefined,
      playlistId: form.playlistId || undefined,
      targetUserId: form.targetUserId || undefined,
    }
    
    const newFeed = await socialStore.createFeed(feedData)
    
    if (newFeed) {
      emit('created', newFeed)
      ElMessage.success('发布成功')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('发布动态失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.song-selector,
.playlist-selector,
.user-selector {
  width: 100%;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-subtitle {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  text-align: right;
}
</style>
