import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlaylistsService } from './playlists.service'
import { PlaylistsController } from './playlists.controller'
import { Playlist } from '../entities/playlist.entity'
import { Song } from '../entities/song.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, Song])],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
