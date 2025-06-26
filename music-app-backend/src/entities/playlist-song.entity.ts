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
import { Playlist } from './playlist.entity'

@Entity('playlist_songs')
export class PlaylistSong {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Playlist, playlist => playlist.id, { onDelete: 'CASCADE' })
  playlist: Playlist

  @Column()
  playlistId: string

  @ManyToOne(() => Song, song => song.id, { onDelete: 'CASCADE' })
  song: Song

  @Column()
  songId: string

  @Column({ default: 0 })
  position: number

  @ManyToOne(() => User, user => user.id)
  addedBy: User

  @Column({ nullable: true })
  addedById: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
