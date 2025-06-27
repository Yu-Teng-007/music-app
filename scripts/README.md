# 脚本使用说明

本文件夹包含了音乐应用项目的所有管理脚本。

## 脚本列表

### 1. start-service.ps1
**功能**: 启动开发环境（前端和后端服务）
**使用方法**: 
```powershell
# 从项目根目录运行
.\scripts\start-service.ps1

# 或者进入scripts目录运行
cd scripts
.\start-service.ps1
```

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

## 注意事项

1. 所有脚本都已经更新了路径引用，可以从项目根目录或scripts目录正常运行
2. 建议从项目根目录运行脚本，使用相对路径 `.\scripts\脚本名.ps1`
3. 如果遇到执行策略问题，可能需要运行：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 常用工作流

1. **首次启动项目**:
   ```powershell
   .\scripts\start-service.ps1
   ```

2. **重置数据库**:
   ```powershell
   .\scripts\clear-database.ps1
   .\scripts\seed-database.ps1
   ```

3. **格式化代码行结束符**:
   ```powershell
   .\scripts\convert-to-lf.ps1
   ```
