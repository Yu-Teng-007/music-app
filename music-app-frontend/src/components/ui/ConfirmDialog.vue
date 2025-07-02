<template>
  <Dialog 
    :visible="true" 
    @close="$emit('cancel')"
    :closable="true"
  >
    <template #header>
      <h3 class="confirm-title">{{ title }}</h3>
    </template>
    
    <template #default>
      <div class="confirm-content">
        <div class="confirm-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
        </div>
        <p class="confirm-message">{{ message }}</p>
      </div>
    </template>
    
    <template #footer>
      <div class="confirm-actions">
        <button @click="$emit('cancel')" class="btn-cancel">
          取消
        </button>
        <button @click="$emit('confirm')" class="btn-confirm">
          确定
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from './Dialog.vue'

interface Props {
  title: string
  message: string
}

defineProps<Props>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.confirm-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.confirm-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.confirm-message {
  font-size: 1rem;
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
  min-width: 80px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #ef4444;
  color: white;
}

.btn-confirm:hover {
  background: #dc2626;
}
</style>
