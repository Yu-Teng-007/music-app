import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { User } from './user.entity'
import { Song } from './song.entity'

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  coverUrl: string

  @Column({ default: false })
  isPrivate: boolean

  @Column({ default: false })
  isDefault: boolean // 标识是否为系统默认歌单

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, user => user.playlists, { onDelete: 'CASCADE' })
  user: User

  @Column()
  userId: string

  @ManyToMany(() => Song, song => song.playlists)
  @JoinTable({
    name: 'playlist_songs',
    joinColumn: {
      name: 'playlistId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'songId',
      referencedColumnName: 'id',
    },
  })
  songs: Song[]
}
