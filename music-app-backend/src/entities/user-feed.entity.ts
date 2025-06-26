import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from './user.entity'
import { Song } from './song.entity'
import { Playlist } from './playlist.entity'

export enum FeedType {
  SHARE_SONG = 'share_song',
  SHARE_PLAYLIST = 'share_playlist',
  LIKE_SONG = 'like_song',
  CREATE_PLAYLIST = 'create_playlist',
  FOLLOW_USER = 'follow_user',
  COMMENT_SONG = 'comment_song',
}

@Entity('user_feeds')
@Index(['userId'])
@Index(['type'])
@Index(['createdAt'])
export class UserFeed {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 36 })
  userId: string

  @Column({
    type: 'enum',
    enum: FeedType,
  })
  type: FeedType

  @Column({ type: 'text', nullable: true })
  content: string

  @Column({ type: 'json', nullable: true })
  metadata: any

  @Column({ type: 'varchar', length: 36, nullable: true })
  songId: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  playlistId: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  targetUserId: string

  @Column({ type: 'int', default: 0 })
  likeCount: number

  @Column({ type: 'int', default: 0 })
  commentCount: number

  @Column({ type: 'int', default: 0 })
  shareCount: number

  @Column({ default: true })
  isVisible: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 关联关系
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Song, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' })
  song: Song

  @ManyToOne(() => Playlist, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlistId' })
  playlist: Playlist

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User
}
