import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { UserPreferencesModule } from './preferences/user-preferences.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserPreferencesModule,
  ],
  exports: [UserPreferencesModule],
})
export class UsersModule {}
