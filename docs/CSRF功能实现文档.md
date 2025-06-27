# CSRF功能实现文档

## 概述

本文档描述了为音乐应用前后端添加的CSRF（跨站请求伪造）保护功能的实现细节。

## 后端实现

### 1. CSRF服务 (`music-app-backend/src/common/security/csrf.service.ts`)

创建了专门的CSRF服务来管理CSRF token的生成和验证：

```typescript
@Injectable()
export class CsrfService {
  private csrfInstance: ReturnType<typeof doubleCsrf>

  constructor() {
    this.csrfInstance = doubleCsrf({
      getSecret: () => process.env.CSRF_SECRET || 'csrf-secret-key',
      cookieName: 'csrf-token',
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
      },
      size: 64,
      getSessionIdentifier: (req: Request) => req.sessionID || '',
      getCsrfTokenFromRequest: req => req.headers['x-csrf-token'] as string,
    })
  }

  generateToken(req: Request, res: Response): string {
    return this.csrfInstance.generateCsrfToken(req, res)
  }
}
```

### 2. 安全模块配置 (`music-app-backend/src/common/security/security.module.ts`)

更新了安全模块以：
- 导出CSRF服务供全局使用
- 配置CSRF保护中间件
- 排除不需要CSRF保护的路由

排除的路由：
- `/api/auth/login` - 登录接口
- `/api/auth/register` - 注册接口  
- `/api/auth/send-sms` - 短信验证码接口
- `/api/csrf-token` - CSRF token获取接口
- 所有GET请求
- 静态文件路径 (`/uploads/`, `/static/`)

### 3. CSRF Token获取端点 (`music-app-backend/src/app.controller.ts`)

添加了获取CSRF token的API端点：

```typescript
@Get('csrf-token')
@ApiOperation({ summary: '获取CSRF令牌' })
getCsrfToken(@Req() req: Request, @Res() res: Response) {
  try {
    const csrfToken = this.csrfService.generateToken(req, res)
    return res.json({
      success: true,
      data: { csrfToken },
      message: 'CSRF令牌获取成功'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'CSRF令牌生成失败',
      error: error.message
    })
  }
}
```

### 4. CORS配置更新

在 `main.ts` 中更新了CORS配置以允许CSRF token头：

```typescript
app.enableCors({
  origin: configService.get<string>('app.frontendUrl'),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
})
```

## 前端实现

### 1. CSRF API服务 (`music-app-frontend/src/services/csrf-api.ts`)

创建了专门的CSRF服务来管理token的获取和缓存：

```typescript
export class CsrfService {
  private csrfToken: string | null = null
  private tokenPromise: Promise<string> | null = null

  async getToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken
    }

    if (this.tokenPromise) {
      return this.tokenPromise
    }

    this.tokenPromise = this.fetchToken()
    
    try {
      this.csrfToken = await this.tokenPromise
      return this.csrfToken
    } finally {
      this.tokenPromise = null
    }
  }

  async refreshToken(): Promise<string> {
    this.clearToken()
    return this.getToken()
  }
}
```

### 2. HTTP客户端更新 (`music-app-frontend/src/services/http.ts`)

更新了axios配置和拦截器：

**配置更新：**
```typescript
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 启用凭据以支持session和CSRF
})
```

**请求拦截器：**
- 自动为需要CSRF保护的请求添加CSRF token
- 排除不需要CSRF保护的请求
- 动态导入CSRF服务以避免循环依赖

**响应拦截器：**
- 处理CSRF验证失败（403错误）
- 自动刷新CSRF token并重试请求
- 处理认证错误和网络错误

### 3. 应用初始化 (`music-app-frontend/src/main.ts`)

在应用启动时初始化CSRF token：

```typescript
const initializeCsrf = async () => {
  try {
    await csrfService.getToken()
    console.log('CSRF token初始化成功')
  } catch (error) {
    console.warn('CSRF token初始化失败:', error)
  }
}

// 启动应用时初始化CSRF token
initializeCsrf()
```

## 安全特性

### 1. Double Submit Cookie模式
使用 `csrf-csrf` 库实现的Double Submit Cookie模式：
- 服务器生成CSRF token并设置为HttpOnly cookie
- 客户端需要在请求头中包含相同的token
- 服务器验证cookie和请求头中的token是否匹配

### 2. Session绑定
CSRF token与用户session绑定，增强安全性：
```typescript
getSessionIdentifier: (req: Request) => req.sessionID || ''
```

### 3. 安全的Cookie配置
```typescript
cookieOptions: {
  secure: process.env.NODE_ENV === 'production', // 生产环境使用HTTPS
  httpOnly: true,                                // 防止XSS攻击
  sameSite: 'lax',                              // 防止CSRF攻击
}
```

### 4. 自动重试机制
前端在CSRF验证失败时会自动：
1. 刷新CSRF token
2. 重试原始请求
3. 避免用户感知到错误

## 测试

创建了测试页面 `test-csrf.html` 来验证CSRF功能：

1. **获取CSRF Token测试** - 验证token获取端点
2. **排除路径测试** - 验证排除的路径不需要CSRF保护
3. **保护路径测试** - 验证需要CSRF保护的请求
4. **无Token测试** - 验证没有token的请求被正确拒绝

## 使用说明

### 开发者使用

1. **后端开发**：
   - 新的POST/PUT/DELETE端点会自动受到CSRF保护
   - 如需排除某个端点，在 `security.module.ts` 的 `excludedPaths` 中添加

2. **前端开发**：
   - HTTP客户端会自动处理CSRF token
   - 无需手动添加CSRF token到请求中
   - 如遇到CSRF错误，检查是否正确配置了 `withCredentials: true`

### 环境变量

在 `.env` 文件中配置：
```
CSRF_SECRET=your-csrf-secret-key
SESSION_SECRET=your-session-secret-key
```

## 注意事项

1. **开发环境**：CSRF cookie不使用secure标志，允许HTTP连接
2. **生产环境**：必须使用HTTPS，CSRF cookie将设置secure标志
3. **跨域请求**：确保前端配置了 `withCredentials: true`
4. **Session管理**：CSRF token依赖于session，确保session配置正确

## 故障排除

### 常见问题

1. **403 CSRF验证失败**：
   - 检查请求是否包含 `x-csrf-token` 头
   - 确认 `withCredentials: true` 已设置
   - 验证session是否正常工作

2. **Token获取失败**：
   - 检查 `/api/csrf-token` 端点是否可访问
   - 确认CORS配置正确
   - 验证网络连接

3. **自动重试失败**：
   - 检查前端错误处理逻辑
   - 确认CSRF服务正常工作
   - 查看浏览器控制台错误信息

## 总结

本CSRF实现提供了：
- ✅ 强大的CSRF保护
- ✅ 自动token管理
- ✅ 透明的用户体验
- ✅ 灵活的配置选项
- ✅ 完整的错误处理
- ✅ 开发友好的调试功能

该实现遵循了安全最佳实践，为应用提供了可靠的CSRF保护。
