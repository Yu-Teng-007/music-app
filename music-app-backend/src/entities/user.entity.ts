import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import { Playlist } from './playlist.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  name: string

  @Column()
  @Exclude()
  password: string

  @Column({ nullable: true })
  avatar: string

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true, type: 'varchar', length: 255 })
  resetPasswordToken: string | null

  @Column({ nullable: true, type: 'datetime' })
  resetPasswordExpires: Date | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Playlist[]
}
