import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AdminUser, AdminRole, AdminPermission } from '../../entities'
import { AdminAuthController } from './admin-auth.controller'
import { AdminAuthService } from './admin-auth.service'
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard'
import { AdminPermissionGuard } from './admin-permission.guard'

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, AdminRole, AdminPermission]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminJwtAuthGuard, AdminPermissionGuard],
  exports: [AdminAuthService, AdminJwtAuthGuard, AdminPermissionGuard],
})
export class AdminAuthModule {}
