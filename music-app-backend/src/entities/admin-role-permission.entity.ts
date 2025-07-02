import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm'
import { AdminRole } from './admin-role.entity'
import { AdminPermission } from './admin-permission.entity'
import { v4 as uuidv4 } from 'uuid'

@Entity('admin_role_permissions')
export class AdminRolePermission {
  @PrimaryColumn('varchar', { length: 36 })
  id: string

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4()
    }
  }

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
