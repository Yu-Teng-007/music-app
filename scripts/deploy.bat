@echo off
setlocal enabledelayedexpansion

REM 音乐应用部署脚本 (Windows版本)
REM 用法: scripts\deploy.bat [frontend|backend|all]

set "deploy_target=%~1"
if "%deploy_target%"=="" set "deploy_target=all"

echo [INFO] 音乐应用部署脚本
echo [INFO] 部署目标: %deploy_target%

REM 检查必要的工具
echo [STEP] 检查部署环境...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm 未安装，请先安装 npm
    exit /b 1
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git 未安装，请先安装 Git
    exit /b 1
)

echo [INFO] 环境检查通过

REM 部署前端
if "%deploy_target%"=="frontend" goto deploy_frontend
if "%deploy_target%"=="all" goto deploy_frontend
goto check_backend

:deploy_frontend
echo [STEP] 开始部署前端...

cd music-app-frontend

echo [INFO] 安装前端依赖...
call npm ci
if %errorlevel% neq 0 (
    echo [ERROR] 前端依赖安装失败
    exit /b 1
)

echo [INFO] 构建前端项目...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] 前端构建失败
    exit /b 1
)

if not exist "dist" (
    echo [ERROR] 前端构建失败，dist 目录不存在
    exit /b 1
)

echo [INFO] 前端构建完成
echo [WARNING] 请确保已在 GitHub 仓库设置中启用 GitHub Pages
echo [WARNING] 并将 Source 设置为 'GitHub Actions'

cd ..

:check_backend
if "%deploy_target%"=="backend" goto prepare_backend
if "%deploy_target%"=="all" goto prepare_backend
goto show_info

:prepare_backend
echo [STEP] 准备后端部署...

cd music-app-backend

echo [INFO] 安装后端依赖...
call npm ci
if %errorlevel% neq 0 (
    echo [ERROR] 后端依赖安装失败
    exit /b 1
)

echo [INFO] 构建后端项目...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] 后端构建失败
    exit /b 1
)

if not exist "dist" (
    echo [ERROR] 后端构建失败，dist 目录不存在
    exit /b 1
)

echo [INFO] 后端构建完成
echo [INFO] 后端已准备好部署到云平台

cd ..

:show_info
echo.
echo [STEP] 部署配置说明
echo.
echo [INFO] === 前端部署 (GitHub Pages) ===
echo 1. 确保 GitHub 仓库设置中启用了 GitHub Pages
echo 2. Source 设置为 'GitHub Actions'
echo 3. 推送代码到 main 分支将自动触发部署
echo 4. 部署完成后访问: https://yourusername.github.io/music-app
echo.
echo [INFO] === 后端部署 (推荐平台) ===
echo 1. Render (推荐):
echo    - 访问 https://render.com
echo    - 连接 GitHub 仓库
echo    - 选择 Blueprint 部署方式
echo    - Render 会自动读取 render.yaml 配置
echo.
echo 2. Railway:
echo    - 访问 https://railway.app
echo    - 连接 GitHub 仓库
echo    - 选择 music-app-backend 目录
echo.
echo 3. Vercel (Serverless):
echo    - 访问 https://vercel.com
echo    - 连接 GitHub 仓库
echo    - 需要配置 Serverless 函数
echo.
echo [WARNING] === 重要配置 ===
echo 1. 更新前端环境变量:
echo    - 编辑 music-app-frontend\.env.production
echo    - 将 VITE_API_BASE_URL 设置为实际的后端 API 地址
echo.
echo 2. 更新后端环境变量:
echo    - 在部署平台设置环境变量
echo    - 参考 music-app-backend\.env.example
echo    - 特别注意 FRONTEND_URL 要包含 GitHub Pages 地址
echo.
echo [INFO] === 部署检查清单 ===
echo □ GitHub Pages 已启用
echo □ 后端平台已选择并配置
echo □ 环境变量已正确设置
echo □ 数据库已创建并连接
echo □ CORS 配置包含前端域名
echo □ 健康检查端点正常工作
echo.
echo [INFO] 部署准备完成！

endlocal
