# 🚀 快速部署指南

## 一键部署

### Windows 用户
```cmd
scripts\deploy.bat all
```

### Linux/macOS 用户
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh all
```

## 部署步骤

### 1. 前端部署到 GitHub Pages

1. **启用 GitHub Pages**
   - 进入 GitHub 仓库设置
   - 找到 "Pages" 选项
   - Source 选择 "GitHub Actions"

2. **推送代码触发自动部署**
   ```bash
   git add .
   git commit -m "部署配置"
   git push origin main
   ```

3. **访问网站**
   - 部署完成后访问: `https://yourusername.github.io/music-app`

### 2. 后端部署到 Render

1. **注册 Render 账号**: https://render.com

2. **连接 GitHub 仓库**
   - 选择 "New +" → "Blueprint"
   - 连接你的 GitHub 仓库
   - Render 会自动读取 `music-app-backend/render.yaml`

3. **配置环境变量**
   - JWT_SECRET: 随机生成强密码
   - FRONTEND_URL: `https://yourusername.github.io/music-app`
   - 数据库信息会自动配置

### 3. 更新配置

1. **更新前端 API 地址**
   ```bash
   # 编辑 music-app-frontend/.env.production
   VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-app.onrender.com
   ```

2. **重新部署前端**
   ```bash
   git add .
   git commit -m "更新API地址"
   git push origin main
   ```

## 验证部署

### 检查前端
- [ ] 网站可以正常访问
- [ ] 页面加载正常
- [ ] 路由跳转正常

### 检查后端
- [ ] API 健康检查: `https://your-backend-url.com/api/health`
- [ ] API 文档: `https://your-backend-url.com/api/docs`
- [ ] 数据库连接正常

### 检查集成
- [ ] 前端可以调用后端 API
- [ ] 用户注册/登录功能正常
- [ ] 跨域请求正常

## 常见问题

### CORS 错误
- 确保后端 `FRONTEND_URL` 包含前端域名
- 检查前端 API 地址是否正确

### 404 错误
- 检查 GitHub Pages 是否启用
- 确认 `vite.config.ts` 中的 `base` 路径正确

### API 连接失败
- 检查后端服务是否正常运行
- 确认前端 `.env.production` 配置正确

## 获取帮助

- 详细部署指南: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 部署检查清单: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- 项目文档: [README.md](./README.md)

---

🎉 部署完成后，您的音乐应用就可以在线访问了！
