# 🔧 Render故障排除指南

## 🚨 常见问题快速诊断

### 问题分类
- [构建失败](#构建失败)
- [启动失败](#启动失败)
- [数据库连接问题](#数据库连接问题)
- [CORS错误](#cors错误)
- [性能问题](#性能问题)
- [SSL/域名问题](#ssl域名问题)

---

## 🔨 构建失败

### 症状
- 部署过程中构建阶段失败
- 日志显示npm install或npm run build错误

### 常见原因和解决方案

#### 1. Node.js版本不兼容
```bash
# 错误信息示例
Error: The engine "node" is incompatible with this module

# 解决方案
1. 检查package.json中的engines字段
2. 在Render中设置正确的Node版本
3. 更新package.json:
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

#### 2. 依赖包安装失败
```bash
# 错误信息示例
npm ERR! peer dep missing

# 解决方案
1. 删除package-lock.json
2. 运行 npm install 重新生成
3. 检查依赖版本冲突
4. 使用 npm audit fix 修复漏洞
```

#### 3. 构建脚本错误
```bash
# 错误信息示例
npm ERR! missing script: build

# 解决方案
确保package.json包含正确的scripts:
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main"
  }
}
```

#### 4. TypeScript编译错误
```bash
# 错误信息示例
TS2307: Cannot find module

# 解决方案
1. 检查tsconfig.json配置
2. 确保所有类型定义已安装
3. 验证import路径正确
4. 运行 npm run build 本地测试
```

---

## 🚀 启动失败

### 症状
- 构建成功但服务无法启动
- 健康检查失败
- 服务状态显示"Failed"

### 常见原因和解决方案

#### 1. 环境变量缺失
```bash
# 错误信息示例
Error: JWT_SECRET is not defined

# 解决方案
1. 检查所有必需环境变量是否设置
2. 验证环境变量名称拼写
3. 确认环境变量值格式正确

必需变量清单:
- NODE_ENV
- PORT
- DATABASE_URL
- JWT_SECRET
- CSRF_SECRET
- SESSION_SECRET
```

#### 2. 端口配置错误
```bash
# 错误信息示例
Error: listen EADDRINUSE :::3000

# 解决方案
确保应用监听正确端口:
const port = process.env.PORT || 3000;
await app.listen(port, '0.0.0.0');
```

#### 3. 启动脚本错误
```bash
# 错误信息示例
Cannot find module 'dist/main'

# 解决方案
1. 确保构建产生了dist目录
2. 检查main.ts文件位置
3. 验证start:prod脚本正确
```

---

## 🗄️ 数据库连接问题

### 症状
- API返回数据库连接错误
- TypeORM连接失败
- 查询超时

### 常见原因和解决方案

#### 1. DATABASE_URL格式错误
```bash
# 错误信息示例
Invalid connection string

# 正确格式
DATABASE_URL=postgresql://username:password@host:port/database

# 解决方案
1. 从Render PostgreSQL服务复制正确的URL
2. 使用Internal Database URL（推荐）
3. 检查URL中的特殊字符是否需要编码
```

#### 2. SSL连接问题
```bash
# 错误信息示例
SSL connection required

# 解决方案
在database.config.ts中配置SSL:
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

#### 3. 连接池配置
```bash
# 错误信息示例
Connection pool exhausted

# 解决方案
优化连接池配置:
extra: {
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
}
```

#### 4. 数据库服务未运行
```bash
# 解决方案
1. 检查Render PostgreSQL服务状态
2. 确认数据库服务在同一区域
3. 验证数据库用户权限
```

---

## 🌐 CORS错误

### 症状
- 前端无法访问API
- 浏览器控制台显示CORS错误
- OPTIONS请求失败

### 常见原因和解决方案

#### 1. FRONTEND_URL配置错误
```bash
# 错误信息示例
Access to fetch at 'api-url' from origin 'frontend-url' has been blocked by CORS policy

# 解决方案
1. 检查FRONTEND_URL环境变量
2. 确保包含所有前端域名
3. 多个域名用逗号分隔:
FRONTEND_URL=https://domain1.com,https://domain2.com
```

#### 2. CORS配置代码问题
```typescript
// 检查main.ts中的CORS配置
app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (frontendUrls.some(url => origin.startsWith(url.trim()))) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});
```

#### 3. 请求头配置
```bash
# 解决方案
确保允许必要的请求头:
allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
```

---

## ⚡ 性能问题

### 症状
- 响应时间过长
- 服务经常超时
- 内存或CPU使用率过高

### 常见原因和解决方案

#### 1. 数据库查询优化
```typescript
// 问题：N+1查询
const users = await userRepository.find();
for (const user of users) {
  user.posts = await postRepository.findByUserId(user.id);
}

// 解决方案：使用关联查询
const users = await userRepository.find({
  relations: ['posts']
});
```

#### 2. 内存泄漏
```bash
# 监控内存使用
1. 在Render Dashboard查看Metrics
2. 检查是否有内存持续增长
3. 使用Node.js内存分析工具

# 常见原因
- 未关闭的数据库连接
- 事件监听器未移除
- 大对象未释放
```

#### 3. 服务计划不足
```bash
# 解决方案
1. 升级到更高的服务计划
2. 优化代码性能
3. 实施缓存策略
4. 使用CDN加速静态资源
```

---

## 🔒 SSL/域名问题

### 症状
- 自定义域名无法访问
- SSL证书错误
- HTTPS重定向失败

### 常见原因和解决方案

#### 1. DNS配置错误
```bash
# 检查DNS记录
nslookup api.yourdomain.com

# 正确配置
Type: CNAME
Name: api
Value: your-service-name.onrender.com
TTL: 300
```

#### 2. SSL证书未生成
```bash
# 解决方案
1. 等待DNS传播（最多48小时）
2. 在Render中重新验证域名
3. 检查域名是否正确添加
```

#### 3. 强制HTTPS问题
```typescript
// 在生产环境强制HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 🔍 调试技巧

### 1. 查看实时日志
```bash
# 在Render Dashboard中
1. 选择你的服务
2. 点击"Logs"标签页
3. 查看实时日志流

# 使用Render CLI
render logs -f your-service-name
```

### 2. 本地调试
```bash
# 使用生产环境变量在本地测试
NODE_ENV=production \
DATABASE_URL=your_db_url \
JWT_SECRET=your_jwt_secret \
npm run start:prod
```

### 3. 健康检查调试
```bash
# 测试健康检查端点
curl -v https://your-service.onrender.com/api/health

# 检查响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://your-service.onrender.com/api/health
```

### 4. 数据库连接测试
```bash
# 使用psql连接测试
psql $DATABASE_URL

# 或使用Node.js脚本测试
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => console.log('Connected')).catch(console.error);
"
```

---

## 📞 获取帮助

### 官方支持
- **Render文档**: https://render.com/docs
- **Render状态页**: https://status.render.com
- **Render社区**: https://community.render.com

### 提交支持请求时包含的信息
1. 服务名称和URL
2. 错误的完整日志
3. 重现步骤
4. 环境变量配置（隐藏敏感信息）
5. 最近的代码更改

### 社区资源
- **Stack Overflow**: 搜索"render.com"标签
- **GitHub Issues**: 在相关项目中搜索类似问题
- **Discord**: 加入Render官方Discord频道

---

## ✅ 预防措施

### 1. 监控设置
- 配置关键指标告警
- 设置健康检查监控
- 定期检查服务状态

### 2. 备份策略
- 定期备份数据库
- 保存环境变量配置
- 记录重要配置更改

### 3. 测试流程
- 在本地测试生产配置
- 使用staging环境验证
- 实施渐进式部署

### 4. 文档维护
- 记录已知问题和解决方案
- 更新部署文档
- 维护故障排除日志
