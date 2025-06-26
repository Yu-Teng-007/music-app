import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

export enum CacheType {
  AUDIO = 'audio',
  COVER = 'cover',
  METADATA = 'metadata',
}

@Entity('download_cache')
@Index(['cacheKey'])
@Index(['type'])
@Index(['createdAt'])
@Index(['lastAccessedAt'])
export class DownloadCache {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  cacheKey: string

  @Column({
    type: 'enum',
    enum: CacheType,
  })
  type: CacheType

  @Column({ type: 'varchar', length: 500 })
  filePath: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalUrl: string

  @Column({ type: 'bigint', default: 0 })
  fileSize: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType: string

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum: string

  @Column({ type: 'int', default: 0 })
  accessCount: number

  @Column({ type: 'datetime', nullable: true })
  lastAccessedAt: Date

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date

  @Column({ default: true })
  isValid: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
