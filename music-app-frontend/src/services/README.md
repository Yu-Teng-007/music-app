# Services 目录结构说明

本目录包含了音乐应用的所有API服务和工具函数，已按功能模块进行了重构和拆分。

## 文件结构

```
services/
├── index.ts              # 统一导出文件
├── api.ts               # 向后兼容的导出文件
├── http.ts              # HTTP客户端配置
├── types.ts             # API类型定义
├── auth-api.ts          # 认证相关API
├── music-api.ts         # 音乐相关API
├── favorites-api.ts     # 收藏相关API
├── playlist-api.ts      # 播放列表相关API
├── upload-api.ts        # 文件上传相关API
├── validators.ts        # 表单验证工具
└── README.md           # 本说明文件
```

## 模块说明

### 核心模块

- **`http.ts`**: 包含axios实例配置、请求/响应拦截器等基础HTTP设置
- **`types.ts`**: 定义所有API相关的TypeScript类型
- **`index.ts`**: 统一导出所有API服务和工具，推荐使用此文件导入
- **`api.ts`**: 为保持向后兼容性而保留的导出文件

### API服务模块

- **`auth-api.ts`**: 用户认证相关的API调用（登录、注册、密码管理等）
- **`music-api.ts`**: 音乐相关的API调用（歌曲查询、播放、搜索等）
- **`favorites-api.ts`**: 收藏功能相关的API调用
- **`playlist-api.ts`**: 播放列表相关的API调用
- **`upload-api.ts`**: 文件上传相关的API调用

### 工具模块

- **`validators.ts`**: 表单验证工具函数

### 状态管理

- **认证相关的业务逻辑**: 已迁移到 `@/stores/auth` Pinia store 中

## 使用方式

### 推荐用法（使用统一导出）

```typescript
// 导入API服务
import { authApi, musicApi, favoritesApi } from '@/services'

// 导入认证状态管理（推荐方式）
import { useAuthStore } from '@/stores/auth'

// 导入验证工具
import { validateEmail, validatePassword } from '@/services'

// 导入类型
import type { ApiResponse, SongQueryParams } from '@/services'

// 在组件中使用
const authStore = useAuthStore()
await authStore.login(credentials)
```

### 按需导入

```typescript
// 只导入需要的API
import { authApi } from '@/services/auth-api'
import { musicApi } from '@/services/music-api'

// 只导入需要的验证函数
import { validateEmail } from '@/services/validators'
```

### 向后兼容用法

```typescript
// 原有的导入方式仍然有效
import { authApi, musicApi } from '@/services/api'
```

## 重构优势

1. **模块化**: 每个文件职责单一，便于维护和测试
2. **类型安全**: 统一的类型定义，减少类型错误
3. **可复用性**: 工具函数独立，可在多处复用
4. **向后兼容**: 保持原有导入方式不变
5. **易于扩展**: 新增功能时只需添加对应模块
6. **状态管理优化**: 认证逻辑直接在 Pinia store 中，符合 Vue 3 最佳实践
7. **减少中间层**: 移除不必要的 AuthService 类，简化架构

## 开发建议

1. **认证操作**: 直接使用 `useAuthStore()` 进行登录、注册等操作
2. **API调用**: 使用 `@/services` 统一导入 API 服务
3. **类型定义**: API相关类型定义统一放在 `types.ts` 中
4. **表单验证**: 验证函数统一放在 `validators.ts` 中
5. **模块独立**: 每个API模块保持独立，避免循环依赖
6. **类型安全**: 使用TypeScript严格模式，确保类型安全
7. **状态管理**: 业务逻辑优先放在对应的 Pinia store 中
