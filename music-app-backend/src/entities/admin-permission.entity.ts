import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm'
import { AdminRole } from './admin-role.entity'

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
}

@Entity('admin_permissions')
export class AdminPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string

  @Column({ type: 'varchar', length: 100 })
  displayName: string

  @Column({ type: 'enum', enum: PermissionType, default: PermissionType.MENU })
  type: PermissionType

  @Column({ type: 'varchar', length: 200, nullable: true })
  resource: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  action: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentId: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: true })
  isActive: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 关联关系
  @ManyToMany(() => AdminRole, role => role.permissions)
  roles: AdminRole[]
}
