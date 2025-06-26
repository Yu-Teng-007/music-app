import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm'
import { User } from './user.entity'
import { Song } from './song.entity'

export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export enum AudioQuality {
  LOW = 'low',      // 64kbps
  MEDIUM = 'medium', // 128kbps
  HIGH = 'high',    // 320kbps
  LOSSLESS = 'lossless', // FLAC
}

@Entity('downloads')
@Unique(['userId', 'songId', 'quality'])
@Index(['userId'])
@Index(['songId'])
@Index(['status'])
@Index(['createdAt'])
export class Download {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 36 })
  userId: string

  @Column({ type: 'varchar', length: 36 })
  songId: string

  @Column({
    type: 'enum',
    enum: AudioQuality,
    default: AudioQuality.MEDIUM,
  })
  quality: AudioQuality

  @Column({
    type: 'enum',
    enum: DownloadStatus,
    default: DownloadStatus.PENDING,
  })
  status: DownloadStatus

  @Column({ type: 'varchar', length: 500, nullable: true })
  localPath: string

  @Column({ type: 'bigint', default: 0 })
  fileSize: number

  @Column({ type: 'bigint', default: 0 })
  downloadedSize: number

  @Column({ type: 'int', default: 0 })
  progress: number // 下载进度百分比 0-100

  @Column({ type: 'varchar', length: 255, nullable: true })
  errorMessage: string

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date

  @Column({ type: 'datetime', nullable: true })
  lastAccessedAt: Date

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 关联关系
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' })
  song: Song
}
