import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { AdminUser } from './admin-user.entity'

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  EXPORT = 'export',
  IMPORT = 'import',
}

@Entity('admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  adminUserId: string

  @Column({ type: 'varchar', length: 50 })
  username: string

  @Column({ type: 'enum', enum: LogAction })
  action: LogAction

  @Column({ type: 'varchar', length: 100 })
  module: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'enum', enum: LogLevel, default: LogLevel.INFO })
  level: LogLevel

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string

  @Column({ type: 'text', nullable: true })
  userAgent: string

  @Column({ type: 'json', nullable: true })
  requestData: any

  @Column({ type: 'json', nullable: true })
  responseData: any

  @Column({ type: 'int', nullable: true })
  duration: number // 请求耗时（毫秒）

  @CreateDateColumn()
  createdAt: Date

  // 关联关系
  @ManyToOne(() => AdminUser, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'adminUserId' })
  adminUser: AdminUser
}
