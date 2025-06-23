# 代码格式化和ESLint配置指南

本文档说明了音乐应用前后端项目的统一代码格式化配置和ESLint检测规则。

## 📋 配置概览

### 统一的Prettier配置
- **分号**: 不使用分号 (`semi: false`)
- **引号**: 单引号 (`singleQuote: true`)
- **尾随逗号**: ES5风格 (`trailingComma: "es5"`)
- **缩进**: 2个空格 (`tabWidth: 2`)
- **行宽**: 100字符 (`printWidth: 100`)
- **箭头函数参数**: 尽可能省略括号 (`arrowParens: "avoid"`)
- **换行符**: LF (`endOfLine: "lf"`)

### 宽松的ESLint规则
- 允许使用 `any` 类型
- 未使用变量仅警告，不报错
- 控制台输出仅警告
- 大部分严格规则降级为警告

## 🛠️ 使用方法

### 前端项目 (Vue + TypeScript)

#### 格式化代码
```bash
cd music-app-frontend

# 格式化所有文件
npm run format

# 检查格式化状态
npm run format:check

# 运行ESLint修复
npm run lint

# 检查ESLint状态
npm run lint:check

# 一键格式化和修复
npm run code-style
```

### 后端项目 (NestJS + TypeScript)

#### 格式化代码
```bash
cd music-app-backend

# 格式化所有文件
npm run format

# 检查格式化状态
npm run format:check

# 运行ESLint修复
npm run lint

# 检查ESLint状态
npm run lint:check

# 一键格式化和修复
npm run code-style
```

## 📁 配置文件位置

### 前端配置文件
- **Prettier配置**: `music-app-frontend/.prettierrc`
- **Prettier忽略**: `music-app-frontend/.prettierignore`
- **ESLint配置**: `music-app-frontend/eslint.config.ts`

### 后端配置文件
- **Prettier配置**: `music-app-backend/.prettierrc`
- **Prettier忽略**: `music-app-backend/.prettierignore`
- **ESLint配置**: `music-app-backend/eslint.config.mjs`

## 🎯 ESLint规则说明

### 前端特定规则
- `vue/multi-word-component-names`: 关闭 - 允许单词组件名
- `vue/require-default-prop`: 关闭 - 不强制默认属性
- `vue/no-v-html`: 关闭 - 允许使用v-html

### 后端特定规则
- `@typescript-eslint/no-unsafe-*`: 警告 - 不严格检查类型安全
- `@typescript-eslint/unbound-method`: 关闭 - 允许方法解绑

### 通用规则
- `@typescript-eslint/no-explicit-any`: 关闭 - 允许any类型
- `no-console`: 警告 - 允许但提醒console使用
- `no-debugger`: 警告 - 允许但提醒debugger使用
- `@typescript-eslint/no-unused-vars`: 警告 - 未使用变量仅警告

## 🔧 IDE集成

### VS Code推荐设置
在项目根目录创建 `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "music-app-frontend",
    "music-app-backend"
  ]
}
```

### 推荐的VS Code扩展
- **Prettier - Code formatter**: 代码格式化
- **ESLint**: JavaScript/TypeScript代码检查
- **Vue Language Features (Volar)**: Vue 3支持
- **TypeScript Vue Plugin (Volar)**: Vue TypeScript支持

## 📝 开发工作流建议

### 提交前检查
```bash
# 前端
cd music-app-frontend
npm run code-style

# 后端
cd music-app-backend
npm run code-style
```

### Git Hooks (可选)
可以配置pre-commit hooks自动运行格式化和检查：

```bash
# 安装husky和lint-staged
npm install --save-dev husky lint-staged

# 配置package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["prettier --write", "eslint --fix"]
  }
}
```

## 🚫 忽略文件

### 通用忽略
- `node_modules/`
- `dist/`
- `coverage/`
- `*.log`
- `.env*`

### 前端特定忽略
- `dist-ssr/`

### 后端特定忽略
- `uploads/`
- `nest-cli.json`

## 🔄 配置更新

如需修改配置：

1. **Prettier配置**: 修改 `.prettierrc` 文件
2. **ESLint规则**: 修改对应的 `eslint.config.*` 文件
3. **忽略文件**: 修改 `.prettierignore` 文件

修改后建议运行一次全项目格式化：
```bash
npm run code-style
```

## 📞 故障排除

### 常见问题

1. **格式化不生效**: 检查IDE是否安装Prettier扩展
2. **ESLint报错**: 检查TypeScript配置和依赖安装
3. **配置冲突**: 确保Prettier和ESLint配置兼容

### 重置配置
如果遇到问题，可以删除配置文件重新生成：
```bash
rm .prettierrc eslint.config.*
# 然后重新按照本指南配置
```
