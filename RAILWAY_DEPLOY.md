# 🚂 Railway 部署指南

Railway 是一个无需信用卡的免费云平台，非常适合部署 Node.js 应用。

## 🆓 为什么选择 Railway？

- ✅ **无需信用卡**：完全免费注册和使用
- ✅ **每月 $5 免费额度**：足够小型项目使用
- ✅ **自动部署**：连接 GitHub 后自动部署
- ✅ **PostgreSQL 数据库**：免费提供数据库服务
- ✅ **不会休眠**：应用保持活跃状态
- ✅ **简单易用**：配置简单，部署快速

## 🚀 部署步骤

### 1. 准备工作

确保您的代码已推送到 GitHub：
```bash
git add .
git commit -m "准备 Railway 部署"
git push origin main
```

### 2. 注册 Railway

1. 访问 [railway.app](https://railway.app)
2. 点击 "Login"
3. 选择 "Login with GitHub"
4. 授权 Railway 访问您的 GitHub

### 3. 创建新项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择您的 `music-app` 仓库
4. Railway 会自动检测到 Node.js 项目

### 4. 配置后端服务

#### 4.1 设置根目录
1. 在项目设置中，找到 "Root Directory"
2. 设置为：`music-app-backend`

#### 4.2 配置构建命令
Railway 会自动使用 `package.json` 中的脚本：
- Build Command: `npm run build`
- Start Command: `npm run start:prod`

### 5. 添加 PostgreSQL 数据库

1. 在 Railway 项目中，点击 "New"
2. 选择 "Database"
3. 选择 "Add PostgreSQL"
4. Railway 会自动创建数据库并设置环境变量

### 6. 配置环境变量

Railway 会自动设置以下数据库环境变量：
- `DATABASE_URL` - 完整的数据库连接字符串

您需要手动添加以下环境变量：

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
FRONTEND_URL=https://yourusername.github.io/music-app
UPLOAD_DIR=uploads
MAX_FILE_SIZE=50MB
```

### 7. 部署

1. 配置完成后，Railway 会自动开始部署
2. 等待构建和部署完成（通常 3-5 分钟）
3. 部署成功后会获得一个 `.up.railway.app` 域名

### 8. 验证部署

#### 8.1 检查健康状态
访问：`https://your-app.up.railway.app/api/health`

#### 8.2 查看 API 文档
访问：`https://your-app.up.railway.app/api/docs`

#### 8.3 测试 API
```bash
curl https://your-app.up.railway.app/api/health
```

### 9. 更新前端配置

修改前端的 API 地址：

#### 9.1 更新 `.env.production`
```env
VITE_API_BASE_URL=https://your-app.up.railway.app/api
VITE_SOCKET_URL=https://your-app.up.railway.app
```

#### 9.2 重新部署前端
```bash
git add .
git commit -m "更新 API 地址为 Railway"
git push origin main
```

## 🔧 故障排除

### 构建失败
1. 检查 Railway 的构建日志
2. 确保 `package.json` 中的脚本正确
3. 验证 Node.js 版本兼容性

### 数据库连接问题
1. 确保 `DATABASE_URL` 环境变量已设置
2. 检查数据库配置是否支持 PostgreSQL
3. 查看应用日志中的错误信息

### CORS 错误
1. 确保 `FRONTEND_URL` 环境变量正确设置
2. 检查前端的 API 地址配置
3. 验证 CORS 配置是否包含前端域名

## 📊 监控和维护

### 查看日志
1. 在 Railway 控制台中选择您的服务
2. 点击 "Deployments" 标签
3. 查看实时日志

### 性能监控
- Railway 提供基本的 CPU 和内存使用情况
- 可以在控制台中查看应用性能指标

### 自动重新部署
- 每次推送到 main 分支时，Railway 会自动重新部署
- 支持回滚到之前的部署版本

## 💰 免费额度

Railway 免费计划包括：
- **$5/月 免费额度**
- **512MB RAM**
- **1 vCPU**
- **1GB 磁盘空间**
- **100GB 网络传输**

对于小型项目来说完全够用！

## 🎉 完成

恭喜！您的音乐应用后端现在已经成功部署到 Railway 了。

下一步：
1. 测试所有 API 功能
2. 更新前端配置
3. 进行端到端测试
4. 享受您的在线音乐应用！
