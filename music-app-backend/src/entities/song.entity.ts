import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Playlist } from './playlist.entity'
import { User } from './user.entity'

@Entity('songs')
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column()
  artist: string

  @Column()
  album: string

  @Column({ type: 'int' })
  duration: number // 持续时间（秒）

  @Column()
  coverUrl: string

  @Column()
  audioUrl: string

  @Column({ nullable: true })
  genre: string

  @Column({ nullable: true })
  year: number

  @Column({ type: 'bigint', default: 0 })
  playCount: number

  @Column({ type: 'text', nullable: true })
  lyrics: string

  @Column({ type: 'bigint', nullable: true })
  fileSize: number // 文件大小（字节）

  @Column({ nullable: true })
  originalFileName: string

  @Column({ nullable: true })
  sourceId: string

  @Column({ nullable: true })
  sourceUrl: string

  // 添加上传者字段
  @Column({ nullable: true })
  uploaderId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 关联关系
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaderId' })
  uploader: User

  @ManyToMany(() => Playlist, playlist => playlist.songs)
  playlists: Playlist[]
}
