# 🔐 Render环境变量配置模板

## 📋 必需环境变量

### 应用基础配置
```bash
# 运行环境
NODE_ENV=production

# 服务端口（Render自动分配，建议设置为10000）
PORT=10000

# 日志级别（生产环境推荐error）
LOG_LEVEL=error
```

### 数据库配置
```bash
# 主数据库连接URL（Render PostgreSQL自动提供）
DATABASE_URL=postgresql://username:password@host:port/database

# 备用数据库配置（如果没有DATABASE_URL时使用）
DB_TYPE=postgres
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=music_app_user
DB_PASSWORD=RENDER_AUTO_GENERATED
DB_DATABASE=music_app_db
```

### 安全配置
```bash
# JWT配置（请生成新的32字节十六进制密钥）
JWT_SECRET=REPLACE_WITH_32_BYTE_HEX_KEY
JWT_EXPIRES_IN=24h

# CSRF保护密钥（请生成新的32字节十六进制密钥）
CSRF_SECRET=REPLACE_WITH_32_BYTE_HEX_KEY

# Session密钥（请生成新的32字节十六进制密钥）
SESSION_SECRET=REPLACE_WITH_32_BYTE_HEX_KEY
```

### 跨域配置
```bash
# 前端域名配置（多个域名用逗号分隔）
FRONTEND_URL=https://yu-teng-007.github.io/music-app,https://your-custom-domain.com
```

---

## 🔑 密钥生成方法

### 方法1：Node.js生成
在浏览器控制台或Node.js环境中运行：
```javascript
const crypto = require('crypto');

// 生成JWT密钥
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));

// 生成CSRF密钥
console.log('CSRF_SECRET=' + crypto.randomBytes(32).toString('hex'));

// 生成Session密钥
console.log('SESSION_SECRET=' + crypto.randomBytes(32).toString('hex'));
```

### 方法2：在线工具
访问以下网站生成密钥：
- https://generate-secret.vercel.app/32
- https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

### 方法3：命令行
```bash
# 生成32字节十六进制密钥
openssl rand -hex 32

# 或使用其他工具
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ⚙️ 可选环境变量

### 文件上传配置
```bash
# 文件上传目录
UPLOAD_DIR=uploads
UPLOAD_PATH=/opt/render/project/src/uploads

# 最大文件大小
MAX_FILE_SIZE=100MB
```

### 性能配置
```bash
# 缓存配置
CACHE_TTL=3600000              # 缓存过期时间（毫秒）
CACHE_MAX_ITEMS=1000           # 最大缓存项数
CACHE_CHECK_PERIOD=600000      # 清理检查周期（毫秒）

# 请求限流配置
THROTTLE_TTL=60                # 限流时间窗口（秒）
THROTTLE_LIMIT=100             # 时间窗口内最大请求数
```

### 第三方服务配置
```bash
# 短信服务配置（如果使用）
SMS_PROVIDER=aliyun
SMS_ACCESS_KEY=your_access_key
SMS_SECRET_KEY=your_secret_key

# 邮件服务配置（如果使用）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 📝 Render配置步骤

### 1. 在Render Dashboard中设置

1. 选择你的Web Service
2. 点击 "Environment" 标签页
3. 点击 "Add Environment Variable"
4. 逐个添加上述环境变量

### 2. 批量导入（推荐）

创建一个 `.env` 文件，包含所有环境变量，然后在Render中批量导入：

```bash
NODE_ENV=production
PORT=10000
LOG_LEVEL=error
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_generated_jwt_secret
CSRF_SECRET=your_generated_csrf_secret
SESSION_SECRET=your_generated_session_secret
FRONTEND_URL=https://yu-teng-007.github.io/music-app
UPLOAD_DIR=uploads
MAX_FILE_SIZE=100MB
CACHE_TTL=3600000
THROTTLE_LIMIT=100
```

---

## 🔍 环境变量验证

### 验证脚本
创建一个验证脚本来检查环境变量：

```javascript
// scripts/validate-env.js
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'CSRF_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL'
];

console.log('🔍 验证环境变量...');

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ 缺少以下环境变量:');
  missing.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
} else {
  console.log('✅ 所有必需的环境变量都已设置');
}

// 验证密钥长度
const secrets = ['JWT_SECRET', 'CSRF_SECRET', 'SESSION_SECRET'];
secrets.forEach(secret => {
  const value = process.env[secret];
  if (value && value.length < 32) {
    console.warn(`⚠️  ${secret} 长度不足32字符，建议使用更强的密钥`);
  }
});
```

### 在package.json中添加验证脚本
```json
{
  "scripts": {
    "validate-env": "node scripts/validate-env.js",
    "prestart:prod": "npm run validate-env && npm run build"
  }
}
```

---

## 🚨 安全注意事项

### 密钥安全
- ✅ 使用强随机密钥（至少32字节）
- ✅ 定期轮换密钥
- ✅ 不要在代码中硬编码密钥
- ✅ 不要将密钥提交到版本控制

### 数据库安全
- ✅ 使用SSL连接
- ✅ 限制数据库访问权限
- ✅ 定期备份数据
- ✅ 监控异常访问

### API安全
- ✅ 启用CORS保护
- ✅ 实施请求限流
- ✅ 验证输入数据
- ✅ 使用HTTPS

---

## 🔄 环境变量更新

### 更新步骤
1. 在Render Dashboard中修改环境变量
2. 保存更改
3. Render会自动重启服务
4. 验证更改是否生效

### 批量更新
如果需要更新多个环境变量：
1. 准备新的环境变量列表
2. 在Render中逐个更新
3. 或使用Render CLI批量更新

### 回滚策略
- 记录每次环境变量更改
- 保留旧配置的备份
- 测试更改后的服务状态
- 如有问题及时回滚

---

## 📞 获取帮助

如果在配置环境变量时遇到问题：

1. **检查Render文档**: https://render.com/docs/environment-variables
2. **查看服务日志**: 在Render Dashboard的Logs标签页
3. **验证变量格式**: 确保没有多余的空格或特殊字符
4. **联系支持**: 通过Render社区或支持渠道

---

## ✅ 配置检查清单

部署前检查：
- [ ] 所有必需环境变量已设置
- [ ] 密钥已生成且长度足够
- [ ] 数据库URL格式正确
- [ ] 前端URL配置正确
- [ ] 文件上传路径配置正确

部署后验证：
- [ ] 服务启动成功
- [ ] 健康检查端点正常
- [ ] 数据库连接正常
- [ ] API接口可访问
- [ ] CORS配置生效
