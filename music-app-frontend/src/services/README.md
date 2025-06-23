# Services 目录结构说明

本目录包含了音乐应用的API服务，已按功能模块进行了重构和拆分。类型定义和工具函数已移动到专门的目录中。

## 文件结构

```
src/
├── services/            # API服务目录
│   ├── index.ts         # 统一导出文件
│   ├── http.ts         # HTTP客户端配置
│   ├── auth-api.ts     # 认证相关API
│   ├── music-api.ts    # 音乐相关API
│   ├── favorites-api.ts # 收藏相关API
│   ├── playlist-api.ts # 播放列表相关API
│   ├── upload-api.ts   # 文件上传相关API
│   └── README.md       # 本说明文件
├── types/              # 类型定义目录
│   ├── api.ts          # API相关类型定义
│   └── index.ts        # 统一导出类型
└── utils/              # 工具函数目录
    ├── validators.ts   # 表单验证工具
    └── index.ts        # 统一导出工具
```

## 模块说明

### 核心模块

- **`http.ts`**: 包含axios实例配置、请求/响应拦截器等基础HTTP设置
- **`index.ts`**: 统一导出所有API服务，推荐使用此文件导入

### API服务模块

- **`auth-api.ts`**: 用户认证相关的API调用（登录、注册、密码管理等）
- **`music-api.ts`**: 音乐相关的API调用（歌曲查询、播放、搜索等）
- **`favorites-api.ts`**: 收藏功能相关的API调用
- **`playlist-api.ts`**: 播放列表相关的API调用
- **`upload-api.ts`**: 文件上传相关的API调用

### 类型定义和工具模块

- **`@/types/api.ts`**: API相关的TypeScript类型定义
- **`@/utils/validators.ts`**: 表单验证工具函数

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
import { validateEmail, validatePassword } from '@/utils/validators'

// 导入类型
import type { ApiResponse, SongQueryParams } from '@/types/api'

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
import { validateEmail } from '@/utils/validators'
```

## 重构优势

1. **模块化**: 每个文件职责单一，便于维护和测试
2. **类型安全**: 统一的类型定义，减少类型错误
3. **可复用性**: 工具函数独立，可在多处复用
4. **清晰的结构**: 移除了冗余的中间文件，结构更加清晰
5. **易于扩展**: 新增功能时只需添加对应模块
6. **状态管理优化**: 认证逻辑直接在 Pinia store 中，符合 Vue 3 最佳实践
7. **减少中间层**: 移除不必要的 AuthService 类，简化架构

## 开发建议

1. **认证操作**: 直接使用 `useAuthStore()` 进行登录、注册等操作
2. **API调用**: 使用 `@/services` 统一导入 API 服务
3. **类型定义**: API相关类型定义统一放在 `@/types/api.ts` 中
4. **表单验证**: 验证函数统一放在 `@/utils/validators.ts` 中
5. **模块独立**: 每个API模块保持独立，避免循环依赖
6. **类型安全**: 使用TypeScript严格模式，确保类型安全
7. **状态管理**: 业务逻辑优先放在对应的 Pinia store 中
