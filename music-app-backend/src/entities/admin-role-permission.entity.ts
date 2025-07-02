import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { AdminRole } from './admin-role.entity'
import { AdminPermission } from './admin-permission.entity'

@Entity('admin_role_permissions')
export class AdminRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  roleId: string

  @Column()
  permissionId: string

  @CreateDateColumn()
  createdAt: Date

  // 关联关系
  @ManyToOne(() => AdminRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: AdminRole

  @ManyToOne(() => AdminPermission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission: AdminPermission
}
