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

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column({ unique: true, nullable: true })
  username: string

  @Column()
  name: string

  @Column()
  @Exclude()
  password: string

  @Column({ nullable: true })
  avatar: string

  @Column({ default: true })
  isActive: boolean

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole

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
