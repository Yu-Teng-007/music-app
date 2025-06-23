# 端口配置说明

本文档说明了音乐应用前后端的端口配置，确保服务之间不会发生端口冲突。

## 端口分配

### 后端服务 (NestJS)
- **开发环境**: `3001` 端口
- **生产环境**: `3000` 端口
- **API 前缀**: `/api`
- **完整地址**: `http://localhost:3001/api` (开发环境)

### 前端服务 (Vue + Vite)
- **开发环境**: `5173` 端口 (Vite 默认)
- **预览模式**: `4173` 端口
- **完整地址**: `http://localhost:5173` (开发环境)

### 数据库服务 (MySQL)
- **端口**: `3306` (MySQL 默认端口)

## 配置文件位置

### 后端配置
- **主配置**: `music-app-backend/src/config/app.config.ts`
- **开发环境**: `music-app-backend/.env.development`
- **生产环境**: `music-app-backend/.env.production`
- **当前环境**: `music-app-backend/.env`

### 前端配置
- **Vite配置**: `music-app-frontend/vite.config.ts`
- **开发环境**: `music-app-frontend/.env.development`
- **生产环境**: `music-app-frontend/.env.production`
- **当前环境**: `music-app-frontend/.env`

## 端口冲突避免策略

1. **明确的端口分离**:
   - 前端: 5173 (开发) / 4173 (预览)
   - 后端: 3001 (开发) / 3000 (生产)
   - 数据库: 3306

2. **环境变量控制**:
   - 所有端口都通过环境变量配置
   - 支持开发和生产环境的不同配置

3. **固定端口设置**:
   - Vite 配置中明确指定端口号
   - 后端配置中设置默认端口

## 启动顺序建议

1. **启动数据库服务** (MySQL on port 3306)
2. **启动后端服务** (NestJS on port 3001)
3. **启动前端服务** (Vue/Vite on port 5173)

## 验证端口配置

### 检查端口占用
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :3001
lsof -i :5173
```

### 测试连接
- 后端 API: `http://localhost:3001/api`
- 前端应用: `http://localhost:5173`

## 环境切换

### 后端环境切换
```bash
cd music-app-backend
npm run env:dev   # 切换到开发环境
npm run env:prod  # 切换到生产环境
```

### 前端环境配置
前端会根据 `.env` 文件自动加载对应的环境配置。

## 注意事项

1. **CORS 配置**: 后端已配置允许前端端口 (5173) 的跨域请求
2. **API 地址**: 前端 HTTP 客户端已配置指向后端 API 地址
3. **环境一致性**: 确保前后端环境配置文件中的端口设置保持一致
4. **防火墙设置**: 确保开发环境中相关端口未被防火墙阻止

## 故障排除

如果遇到端口冲突：

1. 检查端口是否被其他进程占用
2. 修改对应的环境变量文件
3. 重启相关服务
4. 确认前后端配置文件中的端口设置一致
