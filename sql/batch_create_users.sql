-- 批量生成用户的SQL脚本
-- 基于现有的users表结构
-- 表结构：id(UUID), email(unique), name, password, avatar, isActive, resetPasswordToken, resetPasswordExpires, createdAt, updatedAt

-- 使用数据库
USE music_app_dev;

-- 批量插入测试用户数据
-- 注意：密码已使用bcrypt加密（对应明文密码：123456）
INSERT INTO users (
    id,
    email,
    name,
    password,
    avatar,
    isActive,
    resetPasswordToken,
    resetPasswordExpires,
    createdAt,
    updatedAt
) VALUES 
-- 用户1
(
    UUID(),
    'user1@example.com',
    '张三',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户2
(
    UUID(),
    'user2@example.com',
    '李四',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户3
(
    UUID(),
    'user3@example.com',
    '王五',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户4
(
    UUID(),
    'user4@example.com',
    '赵六',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户5
(
    UUID(),
    'user5@example.com',
    '孙七',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户6
(
    UUID(),
    'user6@example.com',
    '周八',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户7
(
    UUID(),
    'user7@example.com',
    '吴九',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user7',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户8
(
    UUID(),
    'user8@example.com',
    '郑十',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户9
(
    UUID(),
    'user9@example.com',
    '冯十一',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user9',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 用户10
(
    UUID(),
    'user10@example.com',
    '陈十二',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user10',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 管理员用户
(
    UUID(),
    'admin@musicapp.com',
    '系统管理员',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- 测试用户
(
    UUID(),
    'test@musicapp.com',
    '测试用户',
    '$2a$12$LQv3c1yqBw2fyuDSiIjW.eHR8.dDNbyBz.2jHm2OppSMaLkIm9OIy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    true,
    NULL,
    NULL,
    NOW(),
    NOW()
);

-- 查询插入的用户数量
SELECT COUNT(*) as '插入的用户数量' FROM users;

-- 查看所有用户信息（不包含密码）
SELECT 
    id,
    email,
    name,
    avatar,
    isActive,
    createdAt,
    updatedAt
FROM users 
ORDER BY createdAt DESC;

-- 验证邮箱唯一性
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 如果需要删除所有测试用户，可以使用以下语句（谨慎使用）
-- DELETE FROM users WHERE email LIKE '%@example.com' OR email LIKE '%@musicapp.com';
