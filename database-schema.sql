-- Cloudflare D1 (SQLite) 数据库架构
-- 音乐应用数据库表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    avatar TEXT,
    isActive INTEGER DEFAULT 1,
    resetPasswordToken TEXT,
    resetPasswordExpires DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 音乐分类表
CREATE TABLE IF NOT EXISTS genres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 歌曲表
CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    duration INTEGER NOT NULL,
    coverUrl TEXT NOT NULL,
    audioUrl TEXT NOT NULL,
    genre TEXT,
    year INTEGER,
    playCount INTEGER DEFAULT 0,
    lyrics TEXT,
    fileSize INTEGER,
    originalFileName TEXT,
    sourceId TEXT,
    sourceUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 歌单表
CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    coverUrl TEXT,
    isPrivate INTEGER DEFAULT 0,
    isDefault INTEGER DEFAULT 0,
    userId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 歌单歌曲关联表
CREATE TABLE IF NOT EXISTS playlist_songs (
    playlistId TEXT NOT NULL,
    songId TEXT NOT NULL,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlistId, songId),
    FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    songId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, songId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    userId TEXT NOT NULL,
    songId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
);

-- 播放历史表
CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    songId TEXT NOT NULL,
    playedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
);

-- 搜索历史表
CREATE TABLE IF NOT EXISTS search_history (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    keyword TEXT NOT NULL,
    searchedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户偏好设置表
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'zh-CN',
    autoPlay INTEGER DEFAULT 1,
    volume REAL DEFAULT 0.8,
    quality TEXT DEFAULT 'standard',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户关注表
CREATE TABLE IF NOT EXISTS user_follows (
    id TEXT PRIMARY KEY,
    followerId TEXT NOT NULL,
    followingId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(followerId, followingId),
    FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户动态表
CREATE TABLE IF NOT EXISTS user_feeds (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    metadata TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 动态点赞表
CREATE TABLE IF NOT EXISTS feed_likes (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    feedId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, feedId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (feedId) REFERENCES user_feeds(id) ON DELETE CASCADE
);

-- 动态评论表
CREATE TABLE IF NOT EXISTS feed_comments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    feedId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (feedId) REFERENCES user_feeds(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_playlists_userId ON playlists(userId);
CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId);
CREATE INDEX IF NOT EXISTS idx_favorites_songId ON favorites(songId);
CREATE INDEX IF NOT EXISTS idx_comments_songId ON comments(songId);
CREATE INDEX IF NOT EXISTS idx_history_userId ON history(userId);
CREATE INDEX IF NOT EXISTS idx_history_playedAt ON history(playedAt);
CREATE INDEX IF NOT EXISTS idx_user_follows_followerId ON user_follows(followerId);
CREATE INDEX IF NOT EXISTS idx_user_follows_followingId ON user_follows(followingId);
CREATE INDEX IF NOT EXISTS idx_user_feeds_userId ON user_feeds(userId);
CREATE INDEX IF NOT EXISTS idx_feed_likes_feedId ON feed_likes(feedId);
CREATE INDEX IF NOT EXISTS idx_feed_comments_feedId ON feed_comments(feedId);

-- 插入默认音乐分类
INSERT OR IGNORE INTO genres (id, name, description) VALUES 
('pop', 'Pop', '流行音乐'),
('rock', 'Rock', '摇滚音乐'),
('jazz', 'Jazz', '爵士音乐'),
('classical', 'Classical', '古典音乐'),
('electronic', 'Electronic', '电子音乐'),
('folk', 'Folk', '民谣音乐'),
('hiphop', 'Hip-Hop', '嘻哈音乐'),
('country', 'Country', '乡村音乐'),
('blues', 'Blues', '蓝调音乐'),
('reggae', 'Reggae', '雷鬼音乐');
