import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm'
import { User } from './user.entity'

@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User

  @Column()
  userId: string

  @Column()
  keyword: string

  @CreateDateColumn()
  createdAt: Date
}
