# 下载服务 (Download Service)

## 功能概述

下载服务提供了完整的音乐文件下载功能，支持多种音质选择、进度跟踪、断点续传等特性。

## 主要功能

### 1. 创建下载任务
- 支持单个歌曲下载
- 支持批量下载
- 自动检查存储空间
- 防止重复下载

### 2. 下载管理
- 实时进度跟踪
- 暂停/恢复下载
- 重试失败的下载
- 自动错误处理

### 3. 音质支持
- **LOW (64kbps)**: 适合网络较慢的环境
- **MEDIUM (128kbps)**: 标准音质，平衡质量和大小
- **HIGH (320kbps)**: 高音质，适合音质要求较高的用户
- **LOSSLESS (FLAC)**: 无损音质，最佳音质体验

### 4. 存储管理
- 用户存储配额管理
- 自动清理过期文件
- 存储统计和监控

## API 接口

### 创建下载任务
```http
POST /api/download
Content-Type: application/json
Authorization: Bearer <token>

{
  "songId": "123e4567-e89b-12d3-a456-426614174000",
  "quality": "high"
}
```

### 批量下载
```http
POST /api/download/batch
Content-Type: application/json
Authorization: Bearer <token>

{
  "songIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "123e4567-e89b-12d3-a456-426614174001"
  ],
  "quality": "medium"
}
```

### 获取下载列表
```http
GET /api/download?page=1&limit=20&status=downloading
Authorization: Bearer <token>
```

### 暂停下载
```http
PUT /api/download/{id}/pause
Authorization: Bearer <token>
```

### 恢复下载
```http
PUT /api/download/{id}/resume
Authorization: Bearer <token>
```

### 重试下载
```http
PUT /api/download/{id}/retry
Authorization: Bearer <token>
```

## 下载流程

1. **创建任务**: 用户选择歌曲和音质，系统创建下载任务
2. **验证检查**: 检查歌曲存在性、存储空间、重复下载等
3. **开始下载**: 从音乐源获取文件，支持流式下载
4. **进度更新**: 实时更新下载进度和状态
5. **音质转换**: 根据选择的音质进行必要的转码
6. **完成处理**: 保存文件到本地，更新数据库状态

## 技术实现

### 核心方法

#### `startDownload(downloadId: string)`
下载的核心逻辑，包括：
- 获取下载任务信息
- 生成本地文件路径
- 执行文件下载
- 处理下载进度
- 错误处理和重试

#### `downloadFile(download: Download, localPath: string)`
文件下载的具体实现：
- 支持直接下载和转码下载
- 流式下载，支持大文件
- 实时进度跟踪
- 文件完整性验证

#### `generateLocalPath(download: Download)`
生成安全的本地文件路径：
- 用户隔离的目录结构
- 文件名安全化处理
- 根据音质选择文件扩展名

### 错误处理
- 网络超时重试
- 文件损坏检测
- 存储空间不足处理
- 并发下载限制

### 安全特性
- 文件名安全化，防止路径遍历攻击
- 用户隔离的存储目录
- 文件大小验证
- 下载配额限制

## 配置选项

```typescript
// 环境变量配置
DOWNLOAD_DIR=./downloads          // 下载目录
MAX_CONCURRENT_DOWNLOADS=3       // 最大并发下载数
DOWNLOAD_TIMEOUT=30000           // 下载超时时间(ms)
MAX_RETRY_ATTEMPTS=3             // 最大重试次数
```

## 使用示例

### 前端调用示例
```typescript
import { downloadApi } from '@/services'

// 下载单个歌曲
const download = await downloadApi.downloadSong('song-id', AudioQuality.HIGH)

// 批量下载
const downloads = await downloadApi.downloadSongs(['song1', 'song2'], AudioQuality.MEDIUM)

// 获取下载进度
const downloads = await downloadApi.getDownloads({ status: 'downloading' })
```

### 状态监听
```typescript
// 监听下载进度更新
socket.on('download:progress', (data) => {
  console.log(`下载进度: ${data.progress}%`)
})

// 监听下载完成
socket.on('download:completed', (data) => {
  console.log(`下载完成: ${data.localPath}`)
})
```

## 注意事项

1. **存储空间**: 确保服务器有足够的存储空间
2. **网络带宽**: 大量并发下载可能影响服务器性能
3. **版权问题**: 确保下载的音乐文件符合版权要求
4. **清理策略**: 定期清理过期或无效的下载文件
5. **监控告警**: 监控下载失败率和存储使用情况

## 扩展功能

### 计划中的功能
- [ ] 断点续传支持
- [ ] P2P 下载加速
- [ ] 云存储集成
- [ ] 下载队列优化
- [ ] 智能音质推荐
- [ ] 下载统计分析

### 性能优化
- [ ] 下载缓存机制
- [ ] 并发控制优化
- [ ] 网络自适应调整
- [ ] 存储压缩算法
