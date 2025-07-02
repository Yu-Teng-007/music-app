import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm'
import { AdminUser } from './admin-user.entity'
import { AdminRole } from './admin-role.entity'
import { v4 as uuidv4 } from 'uuid'

@Entity('admin_user_roles')
export class AdminUserRole {
  @PrimaryColumn('varchar', { length: 36 })
  id: string

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4()
    }
  }

  @Column()
  userId: string

  @Column()
  roleId: string

  @CreateDateColumn()
  createdAt: Date

  // 关联关系
  @ManyToOne(() => AdminUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: AdminUser

  @ManyToOne(() => AdminRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: AdminRole
}
