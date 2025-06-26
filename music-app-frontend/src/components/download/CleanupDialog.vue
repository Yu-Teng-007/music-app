<template>
  <el-dialog
    v-model="dialogVisible"
    title="清理下载文件"
    width="500px"
    :before-close="handleClose"
  >
    <div class="cleanup-content">
      <div class="cleanup-description">
        <p>选择要清理的文件类型，释放存储空间：</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
      >
        <el-form-item label="清理天数">
          <el-input-number
            v-model="form.days"
            :min="1"
            :max="365"
            controls-position="right"
            style="width: 100%"
          />
          <div class="form-help">清理指定天数前的文件</div>
        </el-form-item>

        <el-form-item label="清理选项">
          <el-checkbox-group v-model="cleanupOptions">
            <el-checkbox label="cleanupFailed">清理下载失败的文件</el-checkbox>
            <el-checkbox label="cleanupUnused">清理长时间未访问的文件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="强制清理">
          <el-switch
            v-model="form.force"
            active-text="忽略用户设置"
            inactive-text="遵循用户设置"
          />
          <div class="form-help">强制清理会忽略自动清理设置</div>
        </el-form-item>
      </el-form>

      <!-- 预估清理效果 -->
      <div class="cleanup-preview">
        <div class="preview-title">预估清理效果：</div>
        <div class="preview-items">
          <div class="preview-item">
            <span class="label">预计清理文件：</span>
            <span class="value">约 {{ estimatedFiles }} 个</span>
          </div>
          <div class="preview-item">
            <span class="label">预计释放空间：</span>
            <span class="value">约 {{ estimatedSpace }}</span>
          </div>
        </div>
      </div>

      <!-- 警告提示 -->
      <el-alert
        title="注意：清理操作不可撤销"
        description="被清理的文件将永久删除，请确认后再执行清理操作。"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="danger" 
          @click="handleCleanup"
          :loading="isSubmitting"
        >
          开始清理
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import type { CleanupOptions } from '@/services/download-api'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'cleanup', options: CleanupOptions): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

// 响应式数据
const isSubmitting = ref(false)
const cleanupOptions = ref<string[]>(['cleanupFailed'])

const form = reactive({
  days: 30,
  force: false,
})

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const estimatedFiles = computed(() => {
  // 这里应该根据实际情况计算预估的文件数量
  // 为了演示，使用固定值
  let files = 0
  if (cleanupOptions.value.includes('cleanupFailed')) {
    files += 5
  }
  if (cleanupOptions.value.includes('cleanupUnused')) {
    files += Math.floor(form.days / 10)
  }
  return files
})

const estimatedSpace = computed(() => {
  // 这里应该根据实际情况计算预估的空间大小
  // 为了演示，使用固定值
  const spacePerFile = 5 * 1024 * 1024 // 5MB per file
  const totalBytes = estimatedFiles.value * spacePerFile
  return formatFileSize(totalBytes)
})

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible) {
    resetForm()
  }
})

// 方法
const resetForm = () => {
  form.days = 30
  form.force = false
  cleanupOptions.value = ['cleanupFailed']
  formRef.value?.clearValidate()
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleCleanup = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (cleanupOptions.value.length === 0) {
      ElMessage.warning('请至少选择一种清理选项')
      return
    }
    
    isSubmitting.value = true
    
    const options: CleanupOptions = {
      days: form.days,
      cleanupFailed: cleanupOptions.value.includes('cleanupFailed'),
      cleanupUnused: cleanupOptions.value.includes('cleanupUnused'),
      force: form.force,
    }
    
    emit('cleanup', options)
  } catch (error) {
    console.error('清理参数验证失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.cleanup-content {
  padding: 0 4px;
}

.cleanup-description {
  margin-bottom: 20px;
}

.cleanup-description p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.cleanup-preview {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

.preview-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.preview-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-item .label {
  color: #606266;
  font-size: 14px;
}

.preview-item .value {
  color: #303133;
  font-weight: 500;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-alert) {
  margin-top: 20px;
}
</style>
