import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem, BreadcrumbItem } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 侧边栏状态
  const sidebarCollapsed = ref(false)
  
  // 当前选中的菜单
  const selectedMenuKey = ref('')
  
  // 面包屑导航
  const breadcrumbs = ref<BreadcrumbItem[]>([])
  
  // 页面标题
  const pageTitle = ref('仪表盘')
  
  // 加载状态
  const loading = ref(false)

  // 菜单配置
  const menuItems = ref<MenuItem[]>([
    {
      key: 'dashboard',
      title: '仪表盘',
      icon: 'BarChart3',
      path: '/dashboard',
      permission: 'admin:menu:dashboard',
    },
    {
      key: 'users',
      title: '用户管理',
      icon: 'Users',
      path: '/users',
      permission: 'admin:menu:users',
    },
    {
      key: 'songs',
      title: '歌曲管理',
      icon: 'Music',
      path: '/songs',
      permission: 'admin:menu:songs',
    },
    {
      key: 'analytics',
      title: '数据统计',
      icon: 'TrendingUp',
      path: '/analytics',
      permission: 'admin:menu:analytics',
    },
    {
      key: 'system',
      title: '系统管理',
      icon: 'Settings',
      permission: 'admin:menu:system',
      children: [
        {
          key: 'system-roles',
          title: '角色管理',
          path: '/system/roles',
          permission: 'admin:role:list',
        },
        {
          key: 'system-permissions',
          title: '权限管理',
          path: '/system/permissions',
          permission: 'admin:permission:list',
        },
        {
          key: 'system-config',
          title: '系统配置',
          path: '/system/config',
          permission: 'admin:config:list',
        },
      ],
    },
  ])

  // 切换侧边栏
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 设置侧边栏状态
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  // 设置选中的菜单
  function setSelectedMenuKey(key: string) {
    selectedMenuKey.value = key
  }

  // 设置面包屑
  function setBreadcrumbs(items: BreadcrumbItem[]) {
    breadcrumbs.value = items
  }

  // 设置页面标题
  function setPageTitle(title: string) {
    pageTitle.value = title
    document.title = `${title} - 音乐应用管理后台`
  }

  // 设置加载状态
  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  // 根据路径查找菜单项
  function findMenuByPath(path: string, items: MenuItem[] = menuItems.value): MenuItem | null {
    for (const item of items) {
      if (item.path === path) {
        return item
      }
      if (item.children) {
        const found = findMenuByPath(path, item.children)
        if (found) return found
      }
    }
    return null
  }

  // 根据路径生成面包屑
  function generateBreadcrumbs(path: string) {
    const breadcrumbItems: BreadcrumbItem[] = [
      { title: '首页', path: '/dashboard' }
    ]

    const menuItem = findMenuByPath(path)
    if (menuItem) {
      // 查找父级菜单
      const parentMenu = findParentMenu(menuItem.key)
      if (parentMenu) {
        breadcrumbItems.push({ title: parentMenu.title, path: parentMenu.path })
      }
      breadcrumbItems.push({ title: menuItem.title })
    }

    setBreadcrumbs(breadcrumbItems)
  }

  // 查找父级菜单
  function findParentMenu(childKey: string, items: MenuItem[] = menuItems.value): MenuItem | null {
    for (const item of items) {
      if (item.children) {
        const found = item.children.find(child => child.key === childKey)
        if (found) return item
        
        const parentFound = findParentMenu(childKey, item.children)
        if (parentFound) return parentFound
      }
    }
    return null
  }

  return {
    sidebarCollapsed,
    selectedMenuKey,
    breadcrumbs,
    pageTitle,
    loading,
    menuItems,
    toggleSidebar,
    setSidebarCollapsed,
    setSelectedMenuKey,
    setBreadcrumbs,
    setPageTitle,
    setLoading,
    findMenuByPath,
    generateBreadcrumbs,
  }
})
