import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm'
import { Playlist } from './playlist.entity'

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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(() => Playlist, playlist => playlist.songs)
  playlists: Playlist[]
}
