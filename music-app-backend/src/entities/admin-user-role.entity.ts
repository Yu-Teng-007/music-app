import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { AdminUser } from './admin-user.entity'
import { AdminRole } from './admin-role.entity'

@Entity('admin_user_roles')
export class AdminUserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string

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
