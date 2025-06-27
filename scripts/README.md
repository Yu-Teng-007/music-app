# 脚本使用说明

本文件夹包含了音乐应用项目的所有管理脚本。

## 脚本列表

### 1. start-service.ps1
**功能**: 启动开发环境（前端和/或后端服务），支持单独启动和服务管理
**使用方法**:
```powershell
# 显示帮助信息
.\scripts\start-service.ps1

# 启动所有服务（前端+后端）
.\scripts\start-service.ps1 -All

# 仅启动前端服务
.\scripts\start-service.ps1 -Frontend

# 仅启动后端服务
.\scripts\start-service.ps1 -Backend

# 停止所有运行中的服务
.\scripts\start-service.ps1 -Kill

# 或者进入scripts目录运行
cd scripts
.\start-service.ps1 -All
```

**特性**:
- 自动检测并停止已运行的服务
- 支持单独启动前端或后端
- 自动安装缺失的依赖
- 提供服务管理命令

### 2. clear-database.ps1
**功能**: 清理数据库数据
**使用方法**:
```powershell
# 从项目根目录运行
.\scripts\clear-database.ps1

# 或者进入scripts目录运行
cd scripts
.\clear-database.ps1
```

### 3. seed-database.ps1
**功能**: 向数据库填充种子数据
**使用方法**:
```powershell
# 从项目根目录运行
.\scripts\seed-database.ps1

# 或者进入scripts目录运行
cd scripts
.\seed-database.ps1
```

### 4. convert-to-lf.ps1
**功能**: 将项目中的文本文件行结束符从CRLF转换为LF
**使用方法**:
```powershell
# 从项目根目录运行
.\scripts\convert-to-lf.ps1

# 预览模式（不实际修改文件）
.\scripts\convert-to-lf.ps1 -WhatIf

# 指定特定路径
.\scripts\convert-to-lf.ps1 -Path "music-app-frontend"
```

### 5. update-deps.ps1
**功能**: 更新前后端项目的依赖包
**使用方法**:
```powershell
# 更新所有项目依赖
.\scripts\update-deps.ps1 -All

# 仅更新前端依赖
.\scripts\update-deps.ps1 -Frontend

# 仅更新后端依赖
.\scripts\update-deps.ps1 -Backend

# 检查过期依赖（不更新）
.\scripts\update-deps.ps1 -All -Check

# 预览模式（查看将要执行的命令）
.\scripts\update-deps.ps1 -All -WhatIf

# 使用指定的包管理器
.\scripts\update-deps.ps1 -All -PackageManager yarn
```

## 注意事项

1. 所有脚本都已经更新了路径引用，可以从项目根目录或scripts目录正常运行
2. 建议从项目根目录运行脚本，使用相对路径 `.\scripts\脚本名.ps1`
3. 如果遇到执行策略问题，可能需要运行：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 常用工作流

1. **首次启动项目**:
   ```powershell
   .\scripts\start-service.ps1 -All
   ```

2. **单独启动服务**:
   ```powershell
   # 仅启动前端（用于前端开发）
   .\scripts\start-service.ps1 -Frontend

   # 仅启动后端（用于API测试）
   .\scripts\start-service.ps1 -Backend
   ```

3. **服务管理**:
   ```powershell
   # 停止所有服务
   .\scripts\start-service.ps1 -Kill

   # 重启前端服务
   .\scripts\start-service.ps1 -Frontend
   ```

4. **重置数据库**:
   ```powershell
   .\scripts\clear-database.ps1
   .\scripts\seed-database.ps1
   ```

5. **更新项目依赖**:
   ```powershell
   # 检查过期依赖
   .\scripts\update-deps.ps1 -All -Check

   # 更新所有依赖
   .\scripts\update-deps.ps1 -All
   ```

6. **格式化代码行结束符**:
   ```powershell
   .\scripts\convert-to-lf.ps1
   ```

7. **完整的项目维护流程**:
   ```powershell
   # 1. 更新依赖
   .\scripts\update-deps.ps1 -All

   # 2. 格式化代码
   .\scripts\convert-to-lf.ps1

   # 3. 重置数据库
   .\scripts\clear-database.ps1
   .\scripts\seed-database.ps1

   # 4. 启动服务
   .\scripts\start-service.ps1 -All
   ```

## 开发工作流程示例

### 前端开发工作流
```powershell
# 1. 启动后端服务（提供API）
.\scripts\start-service.ps1 -Backend

# 2. 在另一个终端启动前端服务
.\scripts\start-service.ps1 -Frontend

# 3. 开发完成后停止服务
.\scripts\start-service.ps1 -Kill
```

### 后端开发工作流
```powershell
# 1. 仅启动后端服务
.\scripts\start-service.ps1 -Backend

# 2. 使用API测试工具测试接口
# 3. 开发完成后停止服务
.\scripts\start-service.ps1 -Kill
```

### 全栈开发工作流
```powershell
# 1. 启动所有服务
.\scripts\start-service.ps1 -All

# 2. 同时开发前后端
# 3. 需要重启某个服务时
.\scripts\start-service.ps1 -Frontend  # 重启前端
.\scripts\start-service.ps1 -Backend   # 重启后端
```
