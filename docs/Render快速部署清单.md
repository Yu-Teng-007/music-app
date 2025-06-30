# 🚀 Render快速部署清单

## ⚡ 5分钟快速部署

### 第1步：准备工作 (1分钟)
- [ ] 确保代码已推送到GitHub
- [ ] 注册Render账户: https://render.com
- [ ] 连接GitHub仓库

### 第2步：创建数据库 (2分钟)
- [ ] 点击 "New +" → "PostgreSQL"
- [ ] 设置名称: `music-app-db`
- [ ] 选择计划: Free/Starter
- [ ] 记录 `DATABASE_URL`

### 第3步：生成密钥 (1分钟)
在浏览器控制台运行：
```javascript
const crypto = require('crypto');
console.log('JWT_SECRET:', crypto.randomBytes(32).toString('hex'));
console.log('CSRF_SECRET:', crypto.randomBytes(32).toString('hex'));
console.log('SESSION_SECRET:', crypto.randomBytes(32).toString('hex'));
```

### 第4步：创建Web服务 (1分钟)
- [ ] 点击 "New +" → "Web Service"
- [ ] 选择GitHub仓库
- [ ] 配置基本信息：
  ```
  Name: music-app-backend
  Root Directory: music-app-backend
  Build Command: npm install && npm run build
  Start Command: npm run start:prod
  ```

### 第5步：设置环境变量 (1分钟)
必需变量：
```
NODE_ENV=production
PORT=10000
DATABASE_URL=[从步骤2复制]
JWT_SECRET=[从步骤3复制]
CSRF_SECRET=[从步骤3复制]
SESSION_SECRET=[从步骤3复制]
FRONTEND_URL=https://yu-teng-007.github.io/music-app
```

### 第6步：部署
- [ ] 点击 "Create Web Service"
- [ ] 等待部署完成（3-5分钟）
- [ ] 测试健康检查: `https://your-service.onrender.com/api/health`

---

## 🔧 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `10000` | 服务端口 |
| `DATABASE_URL` | `postgresql://...` | 数据库连接 |
| `JWT_SECRET` | `32字节hex` | JWT密钥 |
| `CSRF_SECRET` | `32字节hex` | CSRF密钥 |
| `SESSION_SECRET` | `32字节hex` | Session密钥 |
| `FRONTEND_URL` | `https://...` | 前端域名 |

---

## 🧪 快速测试

部署完成后测试以下端点：

```bash
# 健康检查
curl https://your-service.onrender.com/api/health

# API文档
https://your-service.onrender.com/api/docs

# CSRF令牌
curl https://your-service.onrender.com/api/csrf-token
```

---

## ❌ 常见错误

### 构建失败
- 检查 `package.json` 中的 `scripts`
- 确保 `build` 和 `start:prod` 脚本存在

### 启动失败
- 检查所有环境变量是否设置
- 验证 `DATABASE_URL` 格式

### 数据库连接失败
- 确认PostgreSQL服务正在运行
- 检查 `DATABASE_URL` 是否正确

### CORS错误
- 检查 `FRONTEND_URL` 环境变量
- 确认前端域名在允许列表中

---

## 📞 获取帮助

- **Render文档**: https://render.com/docs
- **Render社区**: https://community.render.com
- **项目Issues**: 在GitHub仓库中提交问题

---

## 🎯 下一步

部署成功后：
1. 配置自定义域名
2. 设置监控告警
3. 更新前端API地址
4. 进行性能优化

完整指南请参考: [Render部署完整指南.md](./Render部署完整指南.md)
