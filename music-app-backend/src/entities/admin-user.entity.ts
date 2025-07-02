import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import { AdminRole } from './admin-role.entity'

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string

  @Column({ type: 'varchar', length: 100 })
  realName: string

  @Column({ nullable: true })
  avatar: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string

  @Column({ default: true })
  isActive: boolean

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string

  @Column({ type: 'text', nullable: true })
  remark: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 关联关系
  @ManyToMany(() => AdminRole, role => role.users)
  @JoinTable({
    name: 'admin_user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles: AdminRole[]
}
