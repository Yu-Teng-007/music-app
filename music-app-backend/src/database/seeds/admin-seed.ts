import { DataSource } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import {
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminRolePermission,
  AdminUserRole,
  PermissionType,
} from '../../entities'

export async function seedAdminData(dataSource: DataSource) {
  console.log('🌱 开始初始化管理后台数据...')

  const adminUserRepository = dataSource.getRepository(AdminUser)
  const adminRoleRepository = dataSource.getRepository(AdminRole)
  const adminPermissionRepository = dataSource.getRepository(AdminPermission)

  // 创建权限
  const permissions = [
    // 管理员用户管理权限
    {
      name: 'admin:user:list',
      displayName: '查看管理员列表',
      type: PermissionType.API,
      resource: '/admin/users',
      action: 'read',
    },
    {
      name: 'admin:user:detail',
      displayName: '查看管理员详情',
      type: PermissionType.API,
      resource: '/admin/users/:id',
      action: 'read',
    },
    {
      name: 'admin:user:create',
      displayName: '创建管理员',
      type: PermissionType.API,
      resource: '/admin/users',
      action: 'create',
    },
    {
      name: 'admin:user:update',
      displayName: '更新管理员',
      type: PermissionType.API,
      resource: '/admin/users/:id',
      action: 'update',
    },
    {
      name: 'admin:user:delete',
      displayName: '删除管理员',
      type: PermissionType.API,
      resource: '/admin/users/:id',
      action: 'delete',
    },
    {
      name: 'admin:user:reset-password',
      displayName: '重置密码',
      type: PermissionType.API,
      resource: '/admin/users/:id/reset-password',
      action: 'update',
    },
    {
      name: 'admin:user:toggle-status',
      displayName: '启用/禁用用户',
      type: PermissionType.API,
      resource: '/admin/users/:id/toggle-status',
      action: 'update',
    },

    // 歌曲管理权限
    {
      name: 'admin:song:list',
      displayName: '查看歌曲列表',
      type: PermissionType.API,
      resource: '/admin/songs',
      action: 'read',
    },
    {
      name: 'admin:song:detail',
      displayName: '查看歌曲详情',
      type: PermissionType.API,
      resource: '/admin/songs/:id',
      action: 'read',
    },
    {
      name: 'admin:song:create',
      displayName: '创建歌曲',
      type: PermissionType.API,
      resource: '/admin/songs',
      action: 'create',
    },
    {
      name: 'admin:song:update',
      displayName: '更新歌曲',
      type: PermissionType.API,
      resource: '/admin/songs/:id',
      action: 'update',
    },
    {
      name: 'admin:song:delete',
      displayName: '删除歌曲',
      type: PermissionType.API,
      resource: '/admin/songs/:id',
      action: 'delete',
    },
    {
      name: 'admin:song:statistics',
      displayName: '歌曲统计',
      type: PermissionType.API,
      resource: '/admin/songs/statistics',
      action: 'read',
    },

    // 数据统计权限
    {
      name: 'admin:analytics:overview',
      displayName: '总体统计',
      type: PermissionType.API,
      resource: '/admin/analytics/overview',
      action: 'read',
    },
    {
      name: 'admin:analytics:user',
      displayName: '用户统计',
      type: PermissionType.API,
      resource: '/admin/analytics/user-*',
      action: 'read',
    },
    {
      name: 'admin:analytics:play',
      displayName: '播放统计',
      type: PermissionType.API,
      resource: '/admin/analytics/play-*',
      action: 'read',
    },
    {
      name: 'admin:analytics:content',
      displayName: '内容统计',
      type: PermissionType.API,
      resource: '/admin/analytics/content-*',
      action: 'read',
    },

    // 菜单权限
    {
      name: 'admin:menu:dashboard',
      displayName: '仪表盘',
      type: PermissionType.MENU,
      resource: '/admin/dashboard',
    },
    {
      name: 'admin:menu:users',
      displayName: '用户管理',
      type: PermissionType.MENU,
      resource: '/admin/users',
    },
    {
      name: 'admin:menu:songs',
      displayName: '歌曲管理',
      type: PermissionType.MENU,
      resource: '/admin/songs',
    },
    {
      name: 'admin:menu:analytics',
      displayName: '数据统计',
      type: PermissionType.MENU,
      resource: '/admin/analytics',
    },
    {
      name: 'admin:menu:system',
      displayName: '系统管理',
      type: PermissionType.MENU,
      resource: '/admin/system',
    },
  ]

  console.log('📝 创建权限...')
  const createdPermissions = []
  for (const permissionData of permissions) {
    let permission = await adminPermissionRepository.findOne({
      where: { name: permissionData.name },
    })

    if (!permission) {
      permission = adminPermissionRepository.create(permissionData)
      await adminPermissionRepository.save(permission)
      console.log(`  ✅ 创建权限: ${permission.displayName}`)
    } else {
      console.log(`  ⏭️  权限已存在: ${permission.displayName}`)
    }
    createdPermissions.push(permission)
  }

  // 创建角色
  const roles = [
    {
      name: 'super_admin',
      displayName: '超级管理员',
      description: '拥有所有权限的超级管理员',
      permissions: createdPermissions, // 所有权限
    },
    {
      name: 'content_admin',
      displayName: '内容管理员',
      description: '负责内容管理的管理员',
      permissions: createdPermissions.filter(
        p =>
          p.name.includes('song') ||
          p.name.includes('menu:dashboard') ||
          p.name.includes('menu:songs') ||
          p.name.includes('analytics:content')
      ),
    },
    {
      name: 'data_analyst',
      displayName: '数据分析师',
      description: '负责数据分析的管理员',
      permissions: createdPermissions.filter(
        p =>
          p.name.includes('analytics') ||
          p.name.includes('menu:dashboard') ||
          p.name.includes('menu:analytics')
      ),
    },
  ]

  console.log('👥 创建角色...')
  const createdRoles = []
  for (const roleData of roles) {
    let role = await adminRoleRepository.findOne({
      where: { name: roleData.name },
      relations: ['permissions'],
    })

    if (!role) {
      role = adminRoleRepository.create({
        name: roleData.name,
        displayName: roleData.displayName,
        description: roleData.description,
      })
      await adminRoleRepository.save(role)
      console.log(`  ✅ 创建角色: ${role.displayName}`)
    } else {
      console.log(`  ⏭️  角色已存在: ${role.displayName}`)
    }

    // 分配权限 - 手动创建关联记录
    const adminRolePermissionRepository = dataSource.getRepository(AdminRolePermission)

    // 先删除现有的权限关联
    await adminRolePermissionRepository.delete({ roleId: role.id })

    // 创建新的权限关联
    for (const permission of roleData.permissions) {
      const rolePermission = adminRolePermissionRepository.create({
        roleId: role.id,
        permissionId: permission.id,
      })
      await adminRolePermissionRepository.save(rolePermission)
    }

    createdRoles.push(role)
  }

  // 创建默认管理员用户
  const adminUsers = [
    {
      username: 'admin',
      email: 'admin@musicapp.com',
      password: 'admin123',
      realName: '超级管理员',
      roles: [createdRoles.find(r => r.name === 'super_admin')],
    },
    {
      username: 'content_admin',
      email: 'content@musicapp.com',
      password: 'content123',
      realName: '内容管理员',
      roles: [createdRoles.find(r => r.name === 'content_admin')],
    },
    {
      username: 'analyst',
      email: 'analyst@musicapp.com',
      password: 'analyst123',
      realName: '数据分析师',
      roles: [createdRoles.find(r => r.name === 'data_analyst')],
    },
  ]

  console.log('👤 创建管理员用户...')
  for (const userData of adminUsers) {
    let user = await adminUserRepository.findOne({
      where: { username: userData.username },
      relations: ['roles'],
    })

    if (!user) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      user = adminUserRepository.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        realName: userData.realName,
      })
      await adminUserRepository.save(user)
      console.log(`  ✅ 创建管理员: ${user.realName} (${user.username})`)
    } else {
      console.log(`  ⏭️  管理员已存在: ${user.realName} (${user.username})`)
    }

    // 分配角色 - 手动创建关联记录
    const adminUserRoleRepository = dataSource.getRepository(AdminUserRole)

    // 先删除现有的角色关联
    await adminUserRoleRepository.delete({ userId: user.id })

    // 创建新的角色关联
    for (const role of userData.roles.filter(Boolean)) {
      const userRole = adminUserRoleRepository.create({
        userId: user.id,
        roleId: role.id,
      })
      await adminUserRoleRepository.save(userRole)
    }
  }

  console.log('🎉 管理后台数据初始化完成!')
  console.log('')
  console.log('📋 默认管理员账户:')
  console.log('  超级管理员: admin / admin123')
  console.log('  内容管理员: content_admin / content123')
  console.log('  数据分析师: analyst / analyst123')
  console.log('')
}
