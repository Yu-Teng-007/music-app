import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FavoritesController } from './favorites.controller'
import { FavoritesService } from './favorites.service'
import { Favorite } from '../entities/favorite.entity'
import { Song } from '../entities/song.entity'
import { User } from '../entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Song, User])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
