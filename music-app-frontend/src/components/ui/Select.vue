<template>
  <div :class="selectClasses" @click="toggleDropdown">
    <div class="mobile-select__inner">
      <div class="mobile-select__display">
        <span v-if="displayText" class="mobile-select__text">{{ displayText }}</span>
        <span v-else class="mobile-select__placeholder">{{ placeholder }}</span>
      </div>

      <div class="mobile-select__suffix">
        <svg
          :class="['mobile-select__arrow', { 'mobile-select__arrow--reverse': visible }]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
    </div>

    <!-- 下拉选项 -->
    <Transition name="select-dropdown">
      <div v-if="visible" class="mobile-select__dropdown" @click.stop>
        <div class="mobile-select__options">
          <div
            v-for="option in options"
            :key="option.value"
            :class="[
              'mobile-select__option',
              {
                'mobile-select__option--selected': option.value === modelValue,
                'mobile-select__option--disabled': option.disabled,
              },
            ]"
            @click="handleOptionClick(option)"
          >
            <span class="mobile-select__option-text">{{ option.label }}</span>
            <svg
              v-if="option.value === modelValue"
              class="mobile-select__option-check"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: 'large' | 'default' | 'small'
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
  (e: 'visible-change', visible: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  size: 'default',
})

const emit = defineEmits<Emits>()

const visible = ref(false)

const selectClasses = computed(() => [
  'mobile-select',
  `mobile-select--${props.size}`,
  {
    'mobile-select--disabled': props.disabled,
    'mobile-select--focus': visible.value,
  },
])

const displayText = computed(() => {
  const selectedOption = props.options.find(option => option.value === props.modelValue)
  return selectedOption?.label || ''
})

const toggleDropdown = () => {
  if (props.disabled) return

  visible.value = !visible.value
  emit('visible-change', visible.value)
}

const handleOptionClick = (option: Option) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value)
  visible.value = false
  emit('visible-change', false)
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.mobile-select')) {
    visible.value = false
    emit('visible-change', false)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.mobile-select {
  position: relative;
  display: inline-block;
  width: 100%;
  cursor: pointer;
}

.mobile-select--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.mobile-select__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: border-color 0.2s ease;
  min-height: 44px;
  padding: 0 16px;
}

.mobile-select--large .mobile-select__inner {
  min-height: 48px;
  padding: 0 20px;
}

.mobile-select--small .mobile-select__inner {
  min-height: 36px;
  padding: 0 12px;
}

.mobile-select--focus .mobile-select__inner {
  border-color: #64b5f6;
  box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.mobile-select__display {
  flex: 1;
  overflow: hidden;
}

.mobile-select__text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
}

.mobile-select__placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  line-height: 1.5;
}

.mobile-select--large .mobile-select__text,
.mobile-select--large .mobile-select__placeholder {
  font-size: 16px;
}

.mobile-select--small .mobile-select__text,
.mobile-select--small .mobile-select__placeholder {
  font-size: 12px;
}

.mobile-select__suffix {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
}

.mobile-select__arrow {
  transition: transform 0.2s ease;
}

.mobile-select__arrow--reverse {
  transform: rotate(180deg);
}

.mobile-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: 4px;
  max-height: 200px;
  overflow: hidden;
}

.mobile-select__options {
  max-height: 200px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

/* 隐藏 Webkit 浏览器的滚动条 */
.mobile-select__options::-webkit-scrollbar {
  display: none;
}

.mobile-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 44px;
  color: rgba(255, 255, 255, 0.9);
}

.mobile-select__option:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.mobile-select__option--selected {
  background-color: rgba(100, 181, 246, 0.2);
  color: #64b5f6;
}

.mobile-select__option--disabled {
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  background-color: transparent;
}

.mobile-select__option-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.mobile-select__option-check {
  color: #64b5f6;
  margin-left: 8px;
}

/* 动画 */
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top;
}

.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-select__dropdown {
    position: fixed;
    top: auto !important;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 12px 12px 0 0;
    max-height: 50vh;
    margin-top: 0;
  }

  .mobile-select__option {
    padding: 16px 20px;
    min-height: 48px;
    font-size: 16px;
  }

  .select-dropdown-enter-from,
  .select-dropdown-leave-to {
    transform: translateY(100%);
  }
}
</style>
