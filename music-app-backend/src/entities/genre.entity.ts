import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  color: string // 用于UI显示的颜色

  @Column({ nullable: true })
  icon: string // 图标名称或URL

  @Column({ default: true })
  isActive: boolean

  @Column({ default: 0 })
  sortOrder: number // 排序权重

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
