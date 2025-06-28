# 🎵 音乐应用

一个现代化的全栈音乐应用，支持音乐播放、歌单管理、用户社交等功能。

## 🚀 技术栈

### 前端
- **Vue 3** + **TypeScript** - 现代化前端框架
- **Vite** - 快速构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端
- **Socket.IO** - 实时通信

### 后端
- **NestJS** - Node.js 企业级框架
- **TypeScript** - 类型安全
- **TypeORM** - 数据库 ORM
- **MySQL** - 关系型数据库
- **JWT** - 身份认证
- **Socket.IO** - 实时通信
- **Swagger** - API 文档

## 📁 项目结构

```
music-app/
├── music-app-frontend/     # Vue.js 前端应用
├── music-app-backend/      # NestJS 后端应用
├── docs/                   # 项目文档
├── scripts/                # 部署和工具脚本
├── .github/workflows/      # GitHub Actions 工作流
├── DEPLOYMENT.md           # 部署指南
├── DEPLOYMENT_CHECKLIST.md # 部署检查清单
└── README.md              # 项目说明
```

## 🛠️ 本地开发

### 环境要求
- Node.js 18+
- MySQL 8.0+
- Git

### 快速启动

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd music-app
   ```

2. **启动后端**
   ```bash
   cd music-app-backend
   npm install
   cp .env.example .env
   # 配置数据库连接信息
   npm run dev
   ```

3. **启动前端**
   ```bash
   cd music-app-frontend
   npm install
   npm run dev
   ```

4. **访问应用**
   - 前端: http://localhost:5188
   - 后端 API: http://localhost:3000/api
   - API 文档: http://localhost:3000/api/docs

## 🚀 部署指南

### 快速部署

使用我们提供的自动化脚本：

```bash
# Linux/macOS
chmod +x scripts/deploy.sh
./scripts/deploy.sh all

# Windows
scripts\deploy.bat all
```

### 部署架构

- **前端**: GitHub Pages (免费静态托管)
- **后端**: Render/Railway/Vercel (云平台)
- **数据库**: 云数据库服务

### 详细部署步骤

请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取完整的部署指南。

## 📖 功能特性

### 🎵 音乐功能
- 音乐播放和控制
- 歌单创建和管理
- 音乐搜索和分类
- 收藏和历史记录

### 👥 社交功能
- 用户注册和登录
- 用户关注和动态
- 评论和互动
- 个人资料管理

### 🔧 技术特性
- 响应式设计
- 实时通信
- 文件上传
- 安全认证
- API 文档

## 🔧 配置说明

### 环境变量

**前端 (.env.production)**
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
```

**后端 (.env)**
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-db-host
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=music_app
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://yourusername.github.io/music-app
```

## 📚 文档

- [部署指南](./DEPLOYMENT.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [前端架构文档](./docs/前端架构文档.md)
- [后端API文档](./docs/后端API文档.md)
- [数据库设计文档](./docs/数据库设计文档.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到问题或有疑问：

1. 查看 [部署指南](./DEPLOYMENT.md)
2. 检查 [Issues](../../issues) 中是否有类似问题
3. 创建新的 Issue 描述您的问题

## 🎯 路线图

- [ ] 移动端适配
- [ ] PWA 支持
- [ ] 音乐推荐算法
- [ ] 多语言支持
- [ ] 主题定制
- [ ] 离线播放

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
