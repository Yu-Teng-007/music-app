import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Song } from './song.entity'

@Entity('charts')
export class Chart {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  type: string // 排行榜类型: new, hot, trending 等

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  coverUrl: string

  @Column({ default: '每日更新' })
  updateFrequency: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: 0 })
  sortOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(() => Song)
  @JoinTable({
    name: 'chart_songs',
    joinColumn: {
      name: 'chartId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'songId',
      referencedColumnName: 'id',
    },
  })
  songs: Song[]
}
