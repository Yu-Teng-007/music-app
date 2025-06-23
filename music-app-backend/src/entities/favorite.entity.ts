import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm'
import { User } from './user.entity'
import { Song } from './song.entity'

@Entity('favorites')
@Unique(['userId', 'songId']) // 确保用户不能重复收藏同一首歌
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  songId: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  song: Song
}
