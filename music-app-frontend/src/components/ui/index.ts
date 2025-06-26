// 移动端原生UI组件库
export { default as MobileButton } from './Button.vue'
export { default as MobileDialog } from './Dialog.vue'
export { default as MobileInput } from './Input.vue'
export { default as MobileSelect } from './Select.vue'
export { default as MobileSkeleton } from './Skeleton.vue'
export { default as MobileEmpty } from './Empty.vue'
export { default as MobileAvatar } from './Avatar.vue'
export { default as MobileForm } from './Form.vue'
export { default as MobileFormItem } from './FormItem.vue'
export { default as MobileDropdown } from './Dropdown.vue'
export { default as MobileDropdownMenu } from './DropdownMenu.vue'
export { default as MobileDropdownItem } from './DropdownItem.vue'
export { default as MobileRadioGroup } from './RadioGroup.vue'
export { default as MobileCheckbox } from './Checkbox.vue'
export { default as MobileSwitch } from './Switch.vue'
export { default as MobileAlert } from './Alert.vue'

// 类型定义
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 工具函数
export const createSelectOptions = (
  items: Array<{ label: string; value: any; disabled?: boolean }>
): SelectOption[] => {
  return items.map(item => ({
    label: item.label,
    value: item.value,
    disabled: item.disabled || false,
  }))
}

// 消息提示函数（替代ElMessage）
export interface MessageOptions {
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  duration?: number
  showClose?: boolean
}

class MessageManager {
  private container: HTMLElement | null = null
  private messageId = 0

  private createContainer() {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.className = 'mobile-message-container'
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3000;
        pointer-events: none;
      `
      document.body.appendChild(this.container)
    }
    return this.container
  }

  show(options: MessageOptions | string) {
    const opts = typeof options === 'string' ? { message: options } : options
    const { message, type = 'info', duration = 3000, showClose = false } = opts

    const container = this.createContainer()
    const messageEl = document.createElement('div')
    const id = ++this.messageId

    messageEl.className = `mobile-message mobile-message--${type}`
    messageEl.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      font-size: 14px;
      line-height: 1.5;
      max-width: 300px;
      word-break: break-word;
      pointer-events: auto;
      transform: translateY(-100%);
      opacity: 0;
      transition: all 0.3s ease;
    `

    // 设置类型颜色
    const colors = {
      success: '#67c23a',
      warning: '#e6a23c',
      error: '#f56c6c',
      info: '#409eff',
    }

    messageEl.style.borderLeft = `4px solid ${colors[type]}`

    // 添加图标
    const icon = document.createElement('span')
    icon.style.cssText = `
      margin-right: 8px;
      color: ${colors[type]};
      font-size: 16px;
    `

    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ',
    }

    icon.textContent = icons[type]
    messageEl.appendChild(icon)

    // 添加消息文本
    const textEl = document.createElement('span')
    textEl.textContent = message
    textEl.style.flex = '1'
    messageEl.appendChild(textEl)

    // 添加关闭按钮
    if (showClose) {
      const closeBtn = document.createElement('button')
      closeBtn.textContent = '×'
      closeBtn.style.cssText = `
        margin-left: 8px;
        border: none;
        background: none;
        font-size: 18px;
        cursor: pointer;
        color: #909399;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      closeBtn.onclick = () => this.close(messageEl)
      messageEl.appendChild(closeBtn)
    }

    container.appendChild(messageEl)

    // 显示动画
    requestAnimationFrame(() => {
      messageEl.style.transform = 'translateY(0)'
      messageEl.style.opacity = '1'
    })

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.close(messageEl)
      }, duration)
    }

    return {
      close: () => this.close(messageEl),
    }
  }

  private close(messageEl: HTMLElement) {
    messageEl.style.transform = 'translateY(-100%)'
    messageEl.style.opacity = '0'

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl)
      }

      // 如果容器为空，移除容器
      if (this.container && this.container.children.length === 0) {
        document.body.removeChild(this.container)
        this.container = null
      }
    }, 300)
  }

  success(message: string) {
    return this.show({ message, type: 'success' })
  }

  warning(message: string) {
    return this.show({ message, type: 'warning' })
  }

  error(message: string) {
    return this.show({ message, type: 'error' })
  }

  info(message: string) {
    return this.show({ message, type: 'info' })
  }
}

export const MobileMessage = new MessageManager()

// 全局样式注入
const injectGlobalStyles = () => {
  if (typeof document === 'undefined') return

  const styleId = 'mobile-ui-global-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .mobile-message-container {
      pointer-events: none;
    }
    
    .mobile-message {
      pointer-events: auto;
    }
    
    @media (max-width: 768px) {
      .mobile-message-container {
        left: 20px;
        right: 20px;
        transform: none;
      }
      
      .mobile-message {
        max-width: none;
      }
    }
  `

  document.head.appendChild(style)
}

// 自动注入样式
if (typeof window !== 'undefined') {
  injectGlobalStyles()
}
