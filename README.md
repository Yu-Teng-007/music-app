# 音乐播放应用项目

这是一个完整的音乐播放应用，包含前端和后端两个独立的项目。

## 项目结构

```
music-app/
├── music-app-frontend/     # Vue 3 + Vite 前端项目
└── music-app-backend/      # NestJS 后端项目
```

## 前端项目 (music-app-frontend)

### 技术栈
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 现代化构建工具
- **TypeScript** - 类型安全的 JavaScript
- **Vue Router** - 单页面应用路由
- **Pinia** - 状态管理
- **ESLint + Prettier** - 代码质量和格式化

### 已安装的依赖
- `axios` - HTTP 客户端，用于与后端 API 通信
- `@vueuse/core` - Vue 组合式 API 工具集
- `lucide-vue-next` - 现代化图标库

### 启动前端项目
```bash
cd music-app-frontend
npm run dev
```

## 后端项目 (music-app-backend)

### 技术栈
- **NestJS** - 企业级 Node.js 框架
- **TypeScript** - 类型安全的 JavaScript
- **TypeORM** - 对象关系映射
- **PostgreSQL** - 关系型数据库
- **JWT** - 身份验证
- **Passport** - 认证中间件

### 已安装的依赖
- `@nestjs/typeorm` `typeorm` `pg` - 数据库集成
- `@nestjs/config` - 配置管理
- `@nestjs/jwt` `@nestjs/passport` `passport` `passport-jwt` - 身份验证
- `@nestjs/platform-express` `multer` - 文件上传
- `@nestjs/serve-static` - 静态文件服务
- `class-validator` `class-transformer` - 数据验证和转换
- `bcryptjs` - 密码加密

### 启动后端项目
```bash
cd music-app-backend
npm run start:dev
```

## 功能规划

### 核心功能
- 🎵 音乐播放器（播放/暂停、进度条、音量控制）
- 📱 响应式设计（支持移动端和桌面端）
- 🔍 音乐搜索功能
- 📋 播放列表管理
- 👤 用户认证和个人资料
- ⭐ 收藏歌曲功能
- 🎨 现代化 UI 设计

### 界面设计
根据提供的设计稿，应用将包含以下界面：
- 艺人详情页面
- 音乐播放器界面
- 排行榜页面
- 歌词显示页面
- 歌单管理页面
- 设置页面
- 用户个人页面
- 搜索界面

## 下一步计划

1. **实现前端核心组件**
   - 根据设计稿创建音乐播放器组件
   - 实现播放列表、搜索界面等

2. **开发后端 API 接口**
   - 用户认证系统
   - 音乐文件管理
   - 播放列表 CRUD 操作
   - 搜索功能

3. **前后端集成**
   - API 接口对接
   - 数据流管理
   - 错误处理

4. **测试和优化**
   - 单元测试
   - 集成测试
   - 性能优化

## 开发环境要求

- Node.js >= 18.17.1
- npm >= 9.6.7
- PostgreSQL (推荐) 或 MongoDB

## 注意事项

- 项目使用了较新版本的依赖，可能会有一些引擎版本警告，但不影响正常开发
- 建议升级 Node.js 到 20+ 版本以获得更好的兼容性
- 数据库配置需要在后端项目中进行相应设置

---

项目已完成基础架构搭建，可以开始根据设计稿进行具体功能开发。
