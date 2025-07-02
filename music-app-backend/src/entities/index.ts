export { User } from './user.entity'
export { Song } from './song.entity'
export { Genre } from './genre.entity'
export { Playlist } from './playlist.entity'
export { PlaylistSong } from './playlist-song.entity'
export { Favorite } from './favorite.entity'
export { Chart } from './chart.entity'
export { Comment } from './comment.entity'
export { History } from './history.entity'
export { SearchHistory } from './search-history.entity'
export { UserPreference } from './user-preference.entity'

// 社交功能实体
export { UserFollow } from './user-follow.entity'
export { UserFeed } from './user-feed.entity'
export { FeedLike } from './feed-like.entity'
export { FeedComment } from './feed-comment.entity'

// 管理后台实体
export { AdminUser } from './admin-user.entity'
export { AdminRole } from './admin-role.entity'
export { AdminPermission } from './admin-permission.entity'
export { AdminRolePermission } from './admin-role-permission.entity'
export { AdminUserRole } from './admin-user-role.entity'
export { SystemConfig } from './system-config.entity'
export { AdminLog } from './admin-log.entity'

// 离线下载功能实体
export { Download, DownloadStatus, AudioQuality } from './download.entity'
export { DownloadCache } from './download-cache.entity'
export { UserStorage } from './user-storage.entity'
