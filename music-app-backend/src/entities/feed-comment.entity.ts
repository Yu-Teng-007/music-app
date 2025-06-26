import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from './user.entity'
import { UserFeed } from './user-feed.entity'

@Entity('feed_comments')
@Index(['userId'])
@Index(['feedId'])
@Index(['createdAt'])
export class FeedComment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 36 })
  userId: string

  @Column({ type: 'varchar', length: 36 })
  feedId: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'varchar', length: 36, nullable: true })
  replyToId: string

  @Column({ type: 'int', default: 0 })
  likeCount: number

  @Column({ default: true })
  isVisible: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 关联关系
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => UserFeed, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedId' })
  feed: UserFeed

  @ManyToOne(() => FeedComment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'replyToId' })
  replyTo: FeedComment
}
