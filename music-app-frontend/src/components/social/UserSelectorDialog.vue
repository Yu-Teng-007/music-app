<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择用户"
    width="600px"
  >
    <div class="user-selector-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户..."
          @input="handleSearch"
          clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>

      <!-- 用户列表 -->
      <div class="users-list">
        <div v-if="isLoading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="users.length === 0" class="empty-container">
          <el-empty description="暂无用户" />
        </div>

        <div v-else class="users-container">
          <div
            v-for="user in users"
            :key="user.id"
            class="user-item"
            @click="handleSelect(user)"
          >
            <el-avatar 
              :src="user.avatar" 
              :size="48"
              class="user-avatar"
            >
              {{ user.username?.charAt(0) }}
            </el-avatar>
            <div class="user-info">
              <div class="username">{{ user.username }}</div>
              <div class="user-phone">{{ user.phone }}</div>
            </div>
            <div class="select-button">
              <el-button type="primary" size="small">选择</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { User } from '@/types/user'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', user: User): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const users = ref<User[]>([])
const searchKeyword = ref('')
const isLoading = ref(false)

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible) {
    loadUsers()
  }
})

// 方法
const loadUsers = async () => {
  try {
    isLoading.value = true
    // 模拟用户数据，实际应该从API获取
    users.value = [
      {
        id: '1',
        username: '音乐爱好者',
        phone: '138****1234',
        avatar: '',
      },
      {
        id: '2',
        username: '摇滚青年',
        phone: '139****5678',
        avatar: '',
      },
      {
        id: '3',
        username: '古典音乐迷',
        phone: '136****9012',
        avatar: '',
      },
    ] as User[]
  } catch (error) {
    console.error('加载用户失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    loadUsers()
    return
  }

  try {
    isLoading.value = true
    // 简单的本地搜索
    await loadUsers()
    users.value = users.value.filter(user =>
      user.username.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      user.phone.includes(searchKeyword.value)
    )
  } catch (error) {
    console.error('搜索用户失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSelect = (user: User) => {
  emit('select', user)
}

// 初始化
onMounted(() => {
  if (dialogVisible.value) {
    loadUsers()
  }
})
</script>

<style scoped>
.user-selector-content {
  max-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 20px;
}

.users-list {
  flex: 1;
  overflow-y: auto;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.users-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-phone {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-button {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-item:hover .select-button {
  opacity: 1;
}

.dialog-footer {
  text-align: right;
}
</style>
