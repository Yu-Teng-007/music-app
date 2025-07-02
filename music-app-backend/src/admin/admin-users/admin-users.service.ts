import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { AdminUser, AdminRole } from '../../entities'
import { CreateAdminUserDto, UpdateAdminUserDto, AdminQueryDto } from '../../dto'

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminRole)
    private adminRoleRepository: Repository<AdminRole>
  ) {}

  /**
   * 创建管理员用户
   */
  async create(createDto: CreateAdminUserDto) {
    const { username, email, password, roleIds, ...userData } = createDto

    // 检查用户名是否已存在
    const existingUser = await this.adminUserRepository.findOne({
      where: { username },
    })

    if (existingUser) {
      throw new BadRequestException('用户名已存在')
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await this.adminUserRepository.findOne({
        where: { email },
      })

      if (existingEmail) {
        throw new BadRequestException('邮箱已存在')
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const adminUser = this.adminUserRepository.create({
      username,
      email,
      password: hashedPassword,
      ...userData,
    })

    const savedUser = await this.adminUserRepository.save(adminUser)

    // 分配角色
    if (roleIds && roleIds.length > 0) {
      await this.assignRoles(savedUser.id, roleIds)
    }

    return this.findOne(savedUser.id)
  }

  /**
   * 获取管理员用户列表
   */
  async findAll(query: AdminQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query

    const queryBuilder = this.adminUserRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.realName',
        'user.avatar',
        'user.phone',
        'user.isActive',
        'user.lastLoginAt',
        'user.createdAt',
        'user.updatedAt',
        'roles.id',
        'roles.name',
        'roles.displayName',
      ])

    if (search) {
      queryBuilder.where(
        'user.username LIKE :search OR user.realName LIKE :search OR user.email LIKE :search',
        { search: `%${search}%` }
      )
    }

    queryBuilder.orderBy(`user.${sortBy}`, sortOrder)

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * 获取单个管理员用户
   */
  async findOne(id: string) {
    const user = await this.adminUserRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: [
        'id',
        'username',
        'email',
        'realName',
        'avatar',
        'phone',
        'isActive',
        'lastLoginAt',
        'lastLoginIp',
        'remark',
        'createdAt',
        'updatedAt',
      ],
    })

    if (!user) {
      throw new NotFoundException('管理员用户不存在')
    }

    return user
  }

  /**
   * 更新管理员用户
   */
  async update(id: string, updateDto: UpdateAdminUserDto) {
    const { roleIds, ...updateData } = updateDto

    const user = await this.findOne(id)

    // 检查邮箱是否已被其他用户使用
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.adminUserRepository.findOne({
        where: { email: updateData.email },
      })

      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('邮箱已被其他用户使用')
      }
    }

    // 更新用户信息
    await this.adminUserRepository.update(id, updateData)

    // 更新角色
    if (roleIds !== undefined) {
      await this.assignRoles(id, roleIds)
    }

    return this.findOne(id)
  }

  /**
   * 删除管理员用户
   */
  async remove(id: string) {
    const user = await this.findOne(id)
    await this.adminUserRepository.remove(user)
    return { message: '删除成功' }
  }

  /**
   * 重置密码
   */
  async resetPassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await this.adminUserRepository.update(id, { password: hashedPassword })
    return { message: '密码重置成功' }
  }

  /**
   * 启用/禁用用户
   */
  async toggleStatus(id: string) {
    const user = await this.findOne(id)
    await this.adminUserRepository.update(id, { isActive: !user.isActive })
    return this.findOne(id)
  }

  /**
   * 分配角色
   */
  private async assignRoles(userId: string, roleIds: string[]) {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 获取角色
    const roles = await this.adminRoleRepository.findByIds(roleIds)

    // 更新用户角色
    user.roles = roles
    await this.adminUserRepository.save(user)
  }
}
