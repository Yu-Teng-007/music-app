# ☁️ Cloudflare 部署指南

使用您的自定义域名将音乐应用部署到 Cloudflare Pages + Functions。

## 🎯 部署架构

```
您的域名 (your-domain.com)
    ↓
Cloudflare DNS & CDN
    ↓
┌─────────────────────────────────────┐
│ Cloudflare Pages (前端 + 后端)      │
├─────────────────────────────────────┤
│ • 静态文件 (Vue.js 前端)            │
│ • Functions (NestJS API)            │
│ • D1 数据库 (SQLite)                │
│ • R2 存储 (文件上传)                │
│ • KV 存储 (缓存)                    │
└─────────────────────────────────────┘
```

## 🚀 部署步骤

### 1. 准备工作

#### 1.1 安装 Wrangler CLI
```bash
npm install -g wrangler
```

#### 1.2 登录 Cloudflare
```bash
wrangler auth login
```

### 2. 设置 Cloudflare 资源

#### 2.1 创建 D1 数据库
```bash
wrangler d1 create music-app-db
```
记录返回的 database_id，更新到 `wrangler.toml` 中。

#### 2.2 创建 KV 命名空间
```bash
wrangler kv:namespace create CACHE
```
记录返回的 id，更新到 `wrangler.toml` 中。

#### 2.3 创建 R2 存储桶
```bash
wrangler r2 bucket create music-app-uploads
```

### 3. 配置域名

#### 3.1 添加域名到 Cloudflare
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击 "Add a Site"
3. 输入您的域名
4. 选择免费计划
5. 更新域名的 DNS 服务器为 Cloudflare 提供的服务器

#### 3.2 等待 DNS 生效
通常需要 24-48 小时，您可以在 Cloudflare 控制台查看状态。

### 4. 部署应用

#### 4.1 构建项目
```bash
npm run build
```

#### 4.2 部署到 Cloudflare Pages
```bash
wrangler pages deploy music-app-frontend/dist --project-name music-app
```

### 5. 配置自定义域名

#### 5.1 在 Cloudflare Pages 中添加域名
1. 进入 Cloudflare Pages 控制台
2. 选择您的项目
3. 进入 "Custom domains" 标签
4. 点击 "Set up a custom domain"
5. 输入您的域名（如：your-domain.com）

#### 5.2 配置 DNS 记录
Cloudflare 会自动创建必要的 DNS 记录：
- `your-domain.com` → CNAME 指向 Pages 项目
- `www.your-domain.com` → CNAME 指向 Pages 项目

### 6. 环境变量配置

在 Cloudflare Pages 设置中添加环境变量：

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key
FRONTEND_URL=https://your-domain.com
```

### 7. 数据库迁移

#### 7.1 创建数据库表
```bash
# 本地执行迁移脚本生成 SQL
wrangler d1 execute music-app-db --local --file=./database-schema.sql

# 部署到生产环境
wrangler d1 execute music-app-db --file=./database-schema.sql
```

### 8. 验证部署

#### 8.1 检查网站
- 前端：`https://your-domain.com`
- API：`https://your-domain.com/api/health`
- 文档：`https://your-domain.com/api/docs`

#### 8.2 测试功能
- 用户注册/登录
- 音乐播放
- 文件上传
- API 响应

## 🔧 高级配置

### SSL/TLS 设置
1. 在 Cloudflare 控制台进入 "SSL/TLS" 标签
2. 设置加密模式为 "Full (strict)"
3. 启用 "Always Use HTTPS"

### 性能优化
1. 启用 "Auto Minify" (CSS, JS, HTML)
2. 启用 "Brotli" 压缩
3. 配置 "Browser Cache TTL"

### 安全设置
1. 启用 "Security Level: Medium"
2. 配置 "Firewall Rules"
3. 启用 "DDoS Protection"

## 💰 费用说明

### Cloudflare Pages (免费)
- ✅ 无限静态请求
- ✅ 500 次构建/月
- ✅ 100GB 带宽/月

### Cloudflare Functions (免费)
- ✅ 100,000 请求/天
- ✅ 10ms CPU 时间/请求

### D1 数据库 (免费)
- ✅ 5GB 存储
- ✅ 25M 行读取/月
- ✅ 50K 行写入/月

### R2 存储 (免费)
- ✅ 10GB 存储/月
- ✅ 1M Class A 操作/月
- ✅ 10M Class B 操作/月

## 🔄 持续部署

### GitHub Actions 自动部署
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          npm install
          cd music-app-frontend && npm install
          cd ../music-app-backend && npm install
          
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: music-app
          directory: music-app-frontend/dist
```

## 🆘 故障排除

### 常见问题

1. **Functions 超时**
   - 优化数据库查询
   - 使用 KV 缓存
   - 减少外部 API 调用

2. **数据库连接失败**
   - 检查 D1 绑定配置
   - 验证数据库 ID
   - 确认表结构正确

3. **文件上传失败**
   - 检查 R2 存储桶配置
   - 验证文件大小限制
   - 确认 CORS 设置

4. **域名解析问题**
   - 检查 DNS 记录
   - 等待 DNS 传播
   - 验证 Cloudflare 代理状态

## 🎉 完成

恭喜！您的音乐应用现在已经部署到 Cloudflare，并使用您的自定义域名！

优势：
- ⚡ 全球 CDN 加速
- 🔒 免费 SSL 证书
- 🛡️ DDoS 防护
- 📊 详细分析数据
- 💰 完全免费（在限额内）
