import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from './user.entity'

@Entity('user_storage')
export class UserStorage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 36, unique: true })
  userId: string

  @Column({ type: 'bigint', default: 0 })
  usedSpace: number // 已使用空间（字节）

  @Column({ type: 'bigint', default: 1073741824 }) // 默认1GB
  totalSpace: number // 总空间（字节）

  @Column({ type: 'int', default: 0 })
  downloadCount: number // 下载文件数量

  @Column({ type: 'int', default: 1000 }) // 默认最多1000个文件
  maxDownloads: number // 最大下载文件数

  @Column({ type: 'datetime', nullable: true })
  lastCleanupAt: Date // 最后清理时间

  @Column({ default: true })
  autoCleanup: boolean // 是否自动清理

  @Column({ type: 'int', default: 30 }) // 30天
  cleanupDays: number // 清理天数

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 关联关系
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  // 计算属性方法
  getAvailableSpace(): number {
    return this.totalSpace - this.usedSpace
  }

  getUsagePercentage(): number {
    return this.totalSpace > 0 ? (this.usedSpace / this.totalSpace) * 100 : 0
  }

  canDownload(fileSize: number): boolean {
    return this.usedSpace + fileSize <= this.totalSpace && this.downloadCount < this.maxDownloads
  }
}
