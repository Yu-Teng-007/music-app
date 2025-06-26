import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm'
import { User } from './user.entity'
import { UserFeed } from './user-feed.entity'

@Entity('feed_likes')
@Unique(['userId', 'feedId'])
@Index(['userId'])
@Index(['feedId'])
export class FeedLike {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 36 })
  userId: string

  @Column({ type: 'varchar', length: 36 })
  feedId: string

  @CreateDateColumn()
  createdAt: Date

  // 关联关系
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => UserFeed, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedId' })
  feed: UserFeed
}
