# 音乐爬虫系统

## 📖 概述

本系统为音乐应用提供了一个安全、可配置的音乐数据爬虫功能，能够从指定的音乐网站获取歌曲元数据并存储到数据库中。

## ⚠️ 重要声明

**法律和版权提醒：**
- 本爬虫系统仅用于学习和研究目的
- 请确保遵守目标网站的robots.txt和使用条款
- 建议只爬取歌曲元数据（标题、艺术家、专辑等），不要下载受版权保护的音频文件
- 使用时请遵守当地法律法规和版权规定
- 建议使用合法的音乐API（如Spotify API、Last.fm API等）作为替代方案

## 🚀 功能特性

### 核心功能
- ✅ 多种爬取模式（推荐、热门、最新音乐）
- ✅ 可配置的爬取数量（1-100首）
- ✅ 实时进度监控
- ✅ 数据去重和验证
- ✅ 错误处理和重试机制
- ✅ 请求频率限制
- ✅ 随机User-Agent轮换

### 安全特性
- 🔒 JWT身份验证（可选）
- 🛡️ 请求频率限制
- 🔄 自动重试机制
- 📊 详细的日志记录
- ⚡ 优雅的错误处理

## 📁 文件结构

```
src/crawler/
├── music-crawler.service.ts    # 核心爬虫服务
├── crawler.controller.ts       # REST API控制器
└── crawler.module.ts          # 模块配置

src/config/
└── crawler.config.ts          # 爬虫配置

src/dto/
└── song.dto.ts               # 数据传输对象（包含爬虫相关DTO）

test-crawler.js               # 测试脚本
test-crawler.http            # HTTP测试文件
```

## 🔧 配置说明

### 环境变量配置

```bash
# 爬虫基础配置
CRAWLER_BASE_URL=https://www.33ve.com
CRAWLER_TIMEOUT=30000
CRAWLER_REQUEST_DELAY=1000
CRAWLER_MAX_CONCURRENT=3

# 频率限制
CRAWLER_MAX_SONGS_PER_REQUEST=100
CRAWLER_MAX_DAILY_REQUESTS=1000

# 数据验证
CRAWLER_MIN_TITLE_LENGTH=1
CRAWLER_MAX_TITLE_LENGTH=200
CRAWLER_MIN_ARTIST_LENGTH=1
CRAWLER_MAX_ARTIST_LENGTH=100

# 功能开关
CRAWLER_ENABLE_CACHE=true
CRAWLER_ENABLE_RATE_LIMIT=true
CRAWLER_ENABLE_DATA_CLEANING=true
CRAWLER_ENABLE_DUPLICATE_CHECK=true
```

## 📚 API接口

### 1. 获取爬虫配置
```http
GET /api/crawler/config
```

### 2. 开始爬取
```http
POST /api/crawler/start
Content-Type: application/json

{
  "type": "recommended",  // recommended | popular | latest
  "limit": 20,           // 1-100
  "genre": "流行",       // 可选
  "artist": "周杰伦"     // 可选
}
```

### 3. 获取爬取进度
```http
GET /api/crawler/progress
```

### 4. 停止爬取
```http
POST /api/crawler/stop
```

### 5. 重置进度
```http
POST /api/crawler/reset
```

### 6. 测试连接
```http
POST /api/crawler/test
```

### 7. 获取统计信息
```http
GET /api/crawler/stats
```

## 🧪 测试

### 运行测试脚本
```bash
# 确保服务器正在运行
npm run start:dev

# 在另一个终端运行测试
node test-crawler.js
```

### 使用HTTP文件测试
使用VS Code的REST Client插件打开`test-crawler.http`文件进行测试。

## 📊 测试结果

最近的测试结果显示：
- ✅ 成功爬取10首歌曲
- ✅ 100%成功率
- ✅ 0错误
- ✅ 实时进度监控正常
- ✅ 数据成功存储到数据库

### 爬取的歌曲示例：
1. 鸳鸯戏
2. 骄傲的少年
3. 谭咏麟[粤语]朋友
4. 最美的期待
5. 怀念过去
6. 超炫Dance Monkey
7. 抖音网不红
8. 舍得
9. 一百万个可能
10. 姑娘在远方

## 🔄 改进计划

### 短期改进
1. **艺术家信息提取优化** - 改进HTML解析逻辑以获取准确的艺术家信息
2. **封面图片获取** - 提取并保存歌曲封面图片URL
3. **来源信息记录** - 保存sourceId和sourceUrl以便追踪数据来源
4. **歌曲时长获取** - 解析并保存歌曲时长信息

### 长期改进
1. **多网站支持** - 支持多个音乐网站的数据爬取
2. **智能去重** - 基于音频指纹的智能去重算法
3. **数据质量评估** - 自动评估和清洗爬取的数据质量
4. **增量更新** - 支持增量爬取和数据更新

## 🛠️ 故障排除

### 常见问题

1. **连接超时**
   - 检查网络连接
   - 调整CRAWLER_TIMEOUT配置
   - 检查目标网站是否可访问

2. **认证失败**
   - 确保JWT token有效
   - 检查用户权限设置

3. **爬取失败**
   - 检查目标网站结构是否发生变化
   - 查看详细错误日志
   - 调整请求频率

4. **数据质量问题**
   - 检查HTML解析逻辑
   - 调整数据清洗规则
   - 验证CSS选择器

## 📝 使用建议

1. **合理使用频率** - 避免对目标网站造成过大压力
2. **定期检查** - 定期检查爬虫是否正常工作
3. **数据备份** - 定期备份爬取的数据
4. **监控日志** - 关注错误日志和性能指标
5. **遵守法律** - 确保使用符合法律法规要求

## 📞 技术支持

如有问题或建议，请：
1. 查看详细的错误日志
2. 检查配置是否正确
3. 参考本文档的故障排除部分
4. 联系开发团队获取支持

---

**最后更新**: 2025-06-23
**版本**: 1.0.0
**状态**: ✅ 测试通过，功能正常
