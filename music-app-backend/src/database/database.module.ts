import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { Song } from '../entities/song.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Song])],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
