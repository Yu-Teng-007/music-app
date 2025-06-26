<template>
  <div class="search-bar">
    <Search :size="20" />
    <input
      type="text"
      :placeholder="placeholder"
      v-model="searchValue"
      @input="onInputChange"
      @keydown.enter="onSubmit"
    />
    <button v-if="searchValue" class="clear-button" @click="clearSearch">
      <X :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索歌曲、艺人、专辑',
  },
  delay: {
    type: Number,
    default: 300,
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const searchValue = ref(props.modelValue)

// 监听外部modelValue变化
watch(
  () => props.modelValue,
  newValue => {
    searchValue.value = newValue
  }
)

// 监听内部searchValue变化
watch(searchValue, newValue => {
  emit('update:modelValue', newValue)
})

// 搜索防抖
let searchTimeout: number | null = null

const onInputChange = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('search', searchValue.value)
  }, props.delay)
}

const onSubmit = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  emit('search', searchValue.value)
}

const clearSearch = () => {
  searchValue.value = ''
  emit('clear')
  emit('search', '')
}
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 0.75rem 1rem;
  gap: 0.75rem;
  backdrop-filter: blur(10px);
}

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 0.9rem;
  outline: none;
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.clear-button {
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>
