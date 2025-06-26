import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Song } from './song.entity'

@Entity('history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User

  @Column()
  userId: string

  @ManyToOne(() => Song, song => song.id, { onDelete: 'CASCADE' })
  song: Song

  @Column()
  songId: string

  @Column({ default: 1 })
  playCount: number

  @Column({ type: 'timestamp', nullable: true })
  lastPlayedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
