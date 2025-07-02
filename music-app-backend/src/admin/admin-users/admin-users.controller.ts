import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AdminUsersService } from './admin-users.service'
import { CreateAdminUserDto, UpdateAdminUserDto, AdminQueryDto } from '../../dto'
import { AdminJwtAuthGuard } from '../admin-auth/admin-jwt-auth.guard'
import { AdminPermissionGuard } from '../admin-auth/admin-permission.guard'
import { AdminPermissions } from '../admin-auth/admin-permissions.decorator'

@ApiTags('admin-users')
@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
@ApiBearerAuth('JWT-auth')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @AdminPermissions('admin:user:create')
  @ApiOperation({ summary: '创建管理员用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(@Body() createDto: CreateAdminUserDto) {
    const result = await this.adminUsersService.create(createDto)
    return {
      success: true,
      data: result,
      message: '创建成功',
    }
  }

  @Get()
  @AdminPermissions('admin:user:list')
  @ApiOperation({ summary: '获取管理员用户列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async findAll(@Query() query: AdminQueryDto) {
    const result = await this.adminUsersService.findAll(query)
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      message: '获取成功',
    }
  }

  @Get(':id')
  @AdminPermissions('admin:user:detail')
  @ApiOperation({ summary: '获取管理员用户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async findOne(@Param('id') id: string) {
    const result = await this.adminUsersService.findOne(id)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Patch(':id')
  @AdminPermissions('admin:user:update')
  @ApiOperation({ summary: '更新管理员用户' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateAdminUserDto) {
    const result = await this.adminUsersService.update(id, updateDto)
    return {
      success: true,
      data: result,
      message: '更新成功',
    }
  }

  @Delete(':id')
  @AdminPermissions('admin:user:delete')
  @ApiOperation({ summary: '删除管理员用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async remove(@Param('id') id: string) {
    const result = await this.adminUsersService.remove(id)
    return {
      success: true,
      message: result.message,
    }
  }

  @Post(':id/reset-password')
  @AdminPermissions('admin:user:reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async resetPassword(@Param('id') id: string, @Body('password') password: string) {
    const result = await this.adminUsersService.resetPassword(id, password)
    return {
      success: true,
      message: result.message,
    }
  }

  @Post(':id/toggle-status')
  @AdminPermissions('admin:user:toggle-status')
  @ApiOperation({ summary: '启用/禁用用户' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async toggleStatus(@Param('id') id: string) {
    const result = await this.adminUsersService.toggleStatus(id)
    return {
      success: true,
      data: result,
      message: '操作成功',
    }
  }
}
