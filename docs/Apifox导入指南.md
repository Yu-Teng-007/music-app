# 📋 Apifox 爬虫 API 导入指南

## 🚀 方案 1：OpenAPI 规范文件导入（推荐）

### 步骤 1：准备 OpenAPI 文件
已为您生成完整的 OpenAPI 3.0 规范文件：
- 文件位置：`music-app-backend/docs/crawler-api-openapi.json`
- 包含 13 个爬虫相关接口
- 完整的请求/响应模型定义

### 步骤 2：在 Apifox 中导入

1. **打开 Apifox**
   - 启动 Apifox 应用
   - 选择或创建项目

2. **导入 API 文档**
   - 点击左侧菜单 "导入"
   - 选择 "OpenAPI/Swagger"
   - 选择 "从文件导入"
   - 选择 `crawler-api-openapi.json` 文件

3. **配置导入选项**
   - 选择导入方式：建议选择 "智能合并"
   - 确认接口分组：会自动创建 "crawler"、"multi-site"、"duplicate" 分组
   - 点击 "开始导入"

4. **验证导入结果**
   - 检查是否成功导入 13 个接口
   - 验证请求参数和响应模型是否正确
   - 确认接口分组和标签

### 步骤 3：配置环境变量

在 Apifox 中设置环境变量：

```json
{
  "baseUrl": "http://localhost:3000/api",
  "crawlerPath": "/crawler"
}
```

### 步骤 4：测试接口

1. **启动后端服务**
   ```bash
   cd music-app-backend
   npm run start:dev
   ```

2. **测试基础接口**
   - 先测试 `GET /crawler/config`
   - 再测试 `GET /crawler/adapters`
   - 最后测试 `POST /crawler/start`

## 🔧 方案 2：手动创建接口

如果导入失败，可以手动创建：

### 核心接口列表

1. **GET /crawler/config** - 获取爬虫配置
2. **GET /crawler/adapters** - 获取网站适配器
3. **POST /crawler/start** - 开始爬取
4. **GET /crawler/progress** - 查看进度
5. **POST /crawler/stop** - 停止爬取
6. **POST /crawler/reset** - 重置进度
7. **POST /crawler/multi-site** - 多网站爬取
8. **GET /crawler/multi-site/progress** - 多网站进度
9. **GET /crawler/duplicate-stats** - 重复统计
10. **POST /crawler/cleanup-duplicates** - 清理重复
11. **POST /crawler/test** - 测试连接
12. **POST /crawler/test-all-connections** - 测试所有连接
13. **GET /crawler/stats** - 获取统计

### 手动创建步骤

1. **创建接口分组**
   - 爬虫管理
   - 多网站爬取
   - 重复检测

2. **设置请求参数**
   - 参考 OpenAPI 文件中的 schema 定义
   - 设置必填/可选参数
   - 添加参数描述

3. **配置响应示例**
   - 添加成功响应示例
   - 添加错误响应示例
   - 设置响应状态码

## 🛠️ 方案 3：使用 Postman 集合转换

### 创建 Postman 集合

让我为您生成 Postman 集合文件：
