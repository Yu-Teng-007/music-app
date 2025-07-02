import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminUser, AdminRole } from '../../entities'
import { AdminUsersController } from './admin-users.controller'
import { AdminUsersService } from './admin-users.service'
import { AdminAuthModule } from '../admin-auth/admin-auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, AdminRole]),
    AdminAuthModule,
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
