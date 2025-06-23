# Music App MySQL 数据库部署指南

## 项目数据库配置分析

### 当前项目配置概览
- **数据库类型**: MySQL
- **默认端口**: 3306
- **字符集**: utf8mb4
- **时区**: +08:00 (北京时间)
- **ORM框架**: TypeORM
- **数据库驱动**: mysql2

### 环境配置
项目支持多环境配置，通过环境变量文件管理：

#### 开发环境 (.env.development)
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=admin123
DB_DATABASE=music_app_dev
```

#### 生产环境 (.env.production)
```bash
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USERNAME=music_app_user
DB_PASSWORD=admin123
DB_DATABASE=music_app_prod
```

## 数据库表结构

### 核心实体表
1. **users** - 用户表
   - id (UUID, 主键)
   - email (唯一)
   - name
   - password (加密)
   - avatar
   - isActive
   - resetPasswordToken
   - resetPasswordExpires
   - createdAt, updatedAt

2. **songs** - 歌曲表
   - id (UUID, 主键)
   - title, artist, album
   - duration (秒)
   - coverUrl, audioUrl
   - genre, year
   - playCount (bigint)
   - lyrics (text)
   - fileSize (bigint)
   - originalFileName
   - createdAt, updatedAt

3. **playlists** - 播放列表表
   - id (UUID, 主键)
   - name, description
   - coverUrl
   - isPrivate (boolean)
   - userId (外键)
   - createdAt, updatedAt

4. **favorites** - 收藏表
   - id (UUID, 主键)
   - userId, songId (复合唯一索引)
   - createdAt

5. **playlist_songs** - 播放列表歌曲关联表 (多对多)
   - playlistId, songId

## MySQL 安装和配置步骤

### 1. Windows 系统安装 MySQL

#### 方法一：使用 MySQL Installer (推荐)
```bash
# 1. 下载 MySQL Installer
# 访问: https://dev.mysql.com/downloads/installer/
# 选择 mysql-installer-community-8.0.xx.x.msi

# 2. 运行安装程序，选择 "Developer Default" 或 "Server only"

# 3. 配置 MySQL Server
# - 端口: 3306 (默认)
# - 认证方法: Use Strong Password Encryption
# - Root 密码: admin123 (与项目配置一致)
```

#### 方法二：使用 Chocolatey
```bash
# 安装 Chocolatey (如果未安装)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 MySQL
choco install mysql

# 启动 MySQL 服务
net start mysql80
```

### 2. Linux (Ubuntu/Debian) 系统安装

```bash
# 更新包列表
sudo apt update

# 安装 MySQL Server
sudo apt install mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

### 3. macOS 系统安装

```bash
# 使用 Homebrew
brew install mysql

# 启动 MySQL 服务
brew services start mysql

# 或者使用 MySQL 官方安装包
# 下载: https://dev.mysql.com/downloads/mysql/
```

## 数据库和用户配置

### 1. 连接到 MySQL
```bash
# 使用 root 用户连接
mysql -u root -p
# 输入密码: admin123
```

### 2. 创建数据库
```sql
-- 创建开发环境数据库
CREATE DATABASE music_app_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建生产环境数据库
CREATE DATABASE music_app_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 查看数据库
SHOW DATABASES;
```

### 3. 创建专用用户（生产环境推荐）
```sql
-- 创建专用用户
CREATE USER 'music_app_user'@'localhost' IDENTIFIED BY 'admin123';

-- 授予权限
GRANT ALL PRIVILEGES ON music_app_dev.* TO 'music_app_user'@'localhost';
GRANT ALL PRIVILEGES ON music_app_prod.* TO 'music_app_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证用户
SELECT User, Host FROM mysql.user WHERE User = 'music_app_user';
```

### 4. 配置 MySQL 服务器参数
编辑 MySQL 配置文件：

#### Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
#### Linux: `/etc/mysql/mysql.conf.d/mysqld.cnf`

```ini
[mysqld]
# 基本配置
port = 3306
default-time-zone = '+08:00'
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 性能优化
max_connections = 200
innodb_buffer_pool_size = 256M
query_cache_size = 64M

# 安全配置
bind-address = 127.0.0.1  # 仅本地连接
sql_mode = STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO
```

重启 MySQL 服务：
```bash
# Windows
net stop mysql80
net start mysql80

# Linux
sudo systemctl restart mysql

# macOS
brew services restart mysql
```

## 项目数据库初始化

### 1. 配置环境变量
```bash
# 进入后端项目目录
cd music-app-backend

# 切换到开发环境
npm run env:dev

# 验证环境配置
npm run env:check
```

### 2. 安装项目依赖
```bash
# 安装依赖
npm install

# 验证 MySQL 连接依赖
npm list mysql2 typeorm @nestjs/typeorm
```

### 3. 启动项目进行数据库同步
```bash
# 开发模式启动（会自动创建表结构）
npm run start:dev
```

项目启动时会自动：
- 连接到 MySQL 数据库
- 根据实体定义创建表结构（synchronize: true）
- 插入种子数据（如果表为空）

## 验证数据库连接

### 1. 检查表结构
```sql
-- 连接到数据库
USE music_app_dev;

-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE users;
DESCRIBE songs;
DESCRIBE playlists;
DESCRIBE favorites;
DESCRIBE playlist_songs;
```

### 2. 验证种子数据
```sql
-- 检查歌曲数据
SELECT COUNT(*) FROM songs;
SELECT title, artist, album FROM songs LIMIT 5;

-- 检查用户表
SELECT COUNT(*) FROM users;
```

### 3. 测试 API 连接
```bash
# 使用项目提供的测试文件
# 查看 music-app-backend/test-api.http

# 或使用 curl 测试
curl http://localhost:3000/api/songs
```

## 常见问题和解决方案

### 1. 连接被拒绝
**问题**: `ECONNREFUSED 127.0.0.1:3306`
**解决方案**:
```bash
# 检查 MySQL 服务状态
# Windows
sc query mysql80

# Linux
sudo systemctl status mysql

# 启动服务
# Windows
net start mysql80

# Linux
sudo systemctl start mysql
```

### 2. 认证失败
**问题**: `ER_NOT_SUPPORTED_AUTH_MODE`
**解决方案**:
```sql
-- 修改用户认证方式
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin123';
FLUSH PRIVILEGES;
```

### 3. 字符集问题
**问题**: 中文乱码
**解决方案**:
```sql
-- 检查字符集
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 修改数据库字符集
ALTER DATABASE music_app_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 权限不足
**问题**: `Access denied for user`
**解决方案**:
```sql
-- 重新授权
GRANT ALL PRIVILEGES ON music_app_dev.* TO 'music_app_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. 端口冲突
**问题**: 端口 3306 被占用
**解决方案**:
```bash
# 查看端口占用
netstat -an | findstr 3306

# 修改 MySQL 端口或停止冲突服务
```

## 生产环境部署建议

### 1. 安全配置
- 修改默认密码为强密码
- 禁用 root 远程登录
- 启用 SSL 连接
- 配置防火墙规则

### 2. 性能优化
- 调整 innodb_buffer_pool_size
- 配置慢查询日志
- 设置合适的连接池大小

### 3. 备份策略
```bash
# 定期备份
mysqldump -u music_app_user -p music_app_prod > backup_$(date +%Y%m%d).sql

# 恢复备份
mysql -u music_app_user -p music_app_prod < backup_20241223.sql
```

### 4. 监控配置
- 启用性能监控
- 配置日志轮转
- 设置磁盘空间告警

## 下一步操作

1. **验证安装**: 按照上述步骤完成 MySQL 安装和配置
2. **启动项目**: 运行 `npm run start:dev` 验证数据库连接
3. **测试功能**: 使用前端应用测试用户注册、歌曲管理等功能
4. **数据备份**: 建立定期备份机制
5. **性能调优**: 根据实际使用情况调整数据库参数

如有问题，请检查项目日志文件或联系技术支持。
