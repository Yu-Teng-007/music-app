#!/bin/bash

# 音乐应用部署脚本
# 用法: ./scripts/deploy.sh [frontend|backend|all]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查必要的工具
check_requirements() {
    print_step "检查部署环境..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git 未安装，请先安装 Git"
        exit 1
    fi
    
    print_message "环境检查通过"
}

# 部署前端到 GitHub Pages
deploy_frontend() {
    print_step "开始部署前端..."
    
    cd music-app-frontend
    
    # 安装依赖
    print_message "安装前端依赖..."
    npm ci
    
    # 构建项目
    print_message "构建前端项目..."
    npm run build
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        print_error "前端构建失败，dist 目录不存在"
        exit 1
    fi
    
    print_message "前端构建完成"
    print_warning "请确保已在 GitHub 仓库设置中启用 GitHub Pages"
    print_warning "并将 Source 设置为 'GitHub Actions'"
    
    cd ..
}

# 准备后端部署
prepare_backend() {
    print_step "准备后端部署..."
    
    cd music-app-backend
    
    # 安装依赖
    print_message "安装后端依赖..."
    npm ci
    
    # 构建项目
    print_message "构建后端项目..."
    npm run build
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        print_error "后端构建失败，dist 目录不存在"
        exit 1
    fi
    
    print_message "后端构建完成"
    print_message "后端已准备好部署到云平台"
    
    cd ..
}

# 显示部署后的配置说明
show_deployment_info() {
    print_step "部署配置说明"
    
    echo ""
    print_message "=== 前端部署 (GitHub Pages) ==="
    echo "1. 确保 GitHub 仓库设置中启用了 GitHub Pages"
    echo "2. Source 设置为 'GitHub Actions'"
    echo "3. 推送代码到 main 分支将自动触发部署"
    echo "4. 部署完成后访问: https://yourusername.github.io/music-app"
    
    echo ""
    print_message "=== 后端部署 (推荐平台) ==="
    echo "1. Render (推荐):"
    echo "   - 访问 https://render.com"
    echo "   - 连接 GitHub 仓库"
    echo "   - 选择 Blueprint 部署方式"
    echo "   - Render 会自动读取 render.yaml 配置"
    
    echo ""
    echo "2. Railway:"
    echo "   - 访问 https://railway.app"
    echo "   - 连接 GitHub 仓库"
    echo "   - 选择 music-app-backend 目录"
    
    echo ""
    echo "3. Vercel (Serverless):"
    echo "   - 访问 https://vercel.com"
    echo "   - 连接 GitHub 仓库"
    echo "   - 需要配置 Serverless 函数"
    
    echo ""
    print_warning "=== 重要配置 ==="
    echo "1. 更新前端环境变量:"
    echo "   - 编辑 music-app-frontend/.env.production"
    echo "   - 将 VITE_API_BASE_URL 设置为实际的后端 API 地址"
    
    echo ""
    echo "2. 更新后端环境变量:"
    echo "   - 在部署平台设置环境变量"
    echo "   - 参考 music-app-backend/.env.example"
    echo "   - 特别注意 FRONTEND_URL 要包含 GitHub Pages 地址"
    
    echo ""
    print_message "=== 部署检查清单 ==="
    echo "□ GitHub Pages 已启用"
    echo "□ 后端平台已选择并配置"
    echo "□ 环境变量已正确设置"
    echo "□ 数据库已创建并连接"
    echo "□ CORS 配置包含前端域名"
    echo "□ 健康检查端点正常工作"
}

# 主函数
main() {
    local deploy_target=${1:-all}
    
    print_message "音乐应用部署脚本"
    print_message "部署目标: $deploy_target"
    
    check_requirements
    
    case $deploy_target in
        "frontend")
            deploy_frontend
            ;;
        "backend")
            prepare_backend
            ;;
        "all")
            deploy_frontend
            prepare_backend
            ;;
        *)
            print_error "无效的部署目标: $deploy_target"
            print_message "用法: $0 [frontend|backend|all]"
            exit 1
            ;;
    esac
    
    show_deployment_info
    
    print_message "部署准备完成！"
}

# 运行主函数
main "$@"
