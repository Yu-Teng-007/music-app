import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { UserFollow, UserFeed, FeedLike, FeedComment, User, Song, Playlist } from '../entities'
import {
  CreateFeedDto,
  UpdateFeedDto,
  FeedQueryDto,
  FollowQueryDto,
  CreateFeedCommentDto,
  UpdateFeedCommentDto,
  CommentQueryDto,
  SocialStatsDto,
} from '../dto'

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(UserFollow)
    private readonly followRepository: Repository<UserFollow>,
    @InjectRepository(UserFeed)
    private readonly feedRepository: Repository<UserFeed>,
    @InjectRepository(FeedLike)
    private readonly feedLikeRepository: Repository<FeedLike>,
    @InjectRepository(FeedComment)
    private readonly feedCommentRepository: Repository<FeedComment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>
  ) {}

  // 关注用户
  async followUser(followerId: string, followingId: string): Promise<UserFollow> {
    if (followerId === followingId) {
      throw new BadRequestException('不能关注自己')
    }

    // 检查用户是否存在
    const following = await this.userRepository.findOne({ where: { id: followingId } })
    if (!following) {
      throw new NotFoundException('用户不存在')
    }

    // 检查是否已经关注
    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    })
    if (existingFollow) {
      throw new BadRequestException('已经关注该用户')
    }

    // 创建关注关系
    const follow = this.followRepository.create({
      followerId,
      followingId,
    })

    const savedFollow = await this.followRepository.save(follow)

    // 创建关注动态
    await this.createFeed(
      {
        type: 'follow_user' as any,
        targetUserId: followingId,
      },
      followerId
    )

    return savedFollow
  }

  // 取消关注
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    })

    if (!follow) {
      throw new NotFoundException('未关注该用户')
    }

    await this.followRepository.remove(follow)
  }

  // 检查是否关注
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    })
    return !!follow
  }

  // 获取关注列表
  async getFollowing(userId: string, query: FollowQueryDto) {
    const { page = 1, limit = 20, search } = query
    const skip = (page - 1) * limit

    let queryBuilder = this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'user')
      .where('follow.followerId = :userId', { userId })

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(user.username LIKE :search OR user.phone LIKE :search)',
        { search: `%${search}%` }
      )
    }

    const [follows, total] = await queryBuilder
      .orderBy('follow.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: follows.map(follow => follow.following),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // 获取粉丝列表
  async getFollowers(userId: string, query: FollowQueryDto) {
    const { page = 1, limit = 20, search } = query
    const skip = (page - 1) * limit

    let queryBuilder = this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'user')
      .where('follow.followingId = :userId', { userId })

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(user.username LIKE :search OR user.phone LIKE :search)',
        { search: `%${search}%` }
      )
    }

    const [follows, total] = await queryBuilder
      .orderBy('follow.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: follows.map(follow => follow.follower),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // 创建动态
  async createFeed(createFeedDto: CreateFeedDto, userId: string): Promise<UserFeed> {
    const { songId, playlistId, targetUserId } = createFeedDto

    // 验证关联资源是否存在
    if (songId) {
      const song = await this.songRepository.findOne({ where: { id: songId } })
      if (!song) {
        throw new NotFoundException('歌曲不存在')
      }
    }

    if (playlistId) {
      const playlist = await this.playlistRepository.findOne({ where: { id: playlistId } })
      if (!playlist) {
        throw new NotFoundException('歌单不存在')
      }
    }

    if (targetUserId) {
      const user = await this.userRepository.findOne({ where: { id: targetUserId } })
      if (!user) {
        throw new NotFoundException('目标用户不存在')
      }
    }

    const feed = this.feedRepository.create({
      ...createFeedDto,
      userId,
    })

    return await this.feedRepository.save(feed)
  }

  // 获取动态列表
  async getFeeds(query: FeedQueryDto, currentUserId?: string) {
    const { page = 1, limit = 20, userId, type, sortBy = 'createdAt', sortOrder = 'DESC' } = query
    const skip = (page - 1) * limit

    let queryBuilder = this.feedRepository
      .createQueryBuilder('feed')
      .leftJoinAndSelect('feed.user', 'user')
      .leftJoinAndSelect('feed.song', 'song')
      .leftJoinAndSelect('feed.playlist', 'playlist')
      .leftJoinAndSelect('feed.targetUser', 'targetUser')
      .where('feed.isVisible = :isVisible', { isVisible: true })

    if (userId) {
      queryBuilder = queryBuilder.andWhere('feed.userId = :userId', { userId })
    }

    if (type) {
      queryBuilder = queryBuilder.andWhere('feed.type = :type', { type })
    }

    // 如果有当前用户，只显示关注用户的动态
    if (currentUserId && !userId) {
      const followingIds = await this.getFollowingIds(currentUserId)
      followingIds.push(currentUserId) // 包含自己的动态

      if (followingIds.length > 0) {
        queryBuilder = queryBuilder.andWhere('feed.userId IN (:...followingIds)', { followingIds })
      } else {
        // 如果没有关注任何人，只显示自己的动态
        queryBuilder = queryBuilder.andWhere('feed.userId = :currentUserId', { currentUserId })
      }
    }

    const [feeds, total] = await queryBuilder
      .orderBy(`feed.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: feeds,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // 获取关注用户ID列表
  private async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      select: ['followingId'],
    })
    return follows.map(follow => follow.followingId)
  }

  // 删除动态
  async deleteFeed(feedId: string, userId: string): Promise<void> {
    const feed = await this.feedRepository.findOne({
      where: { id: feedId },
    })

    if (!feed) {
      throw new NotFoundException('动态不存在')
    }

    if (feed.userId !== userId) {
      throw new ForbiddenException('只能删除自己的动态')
    }

    await this.feedRepository.remove(feed)
  }

  // 点赞动态
  async likeFeed(feedId: string, userId: string): Promise<FeedLike> {
    const feed = await this.feedRepository.findOne({ where: { id: feedId } })
    if (!feed) {
      throw new NotFoundException('动态不存在')
    }

    // 检查是否已经点赞
    const existingLike = await this.feedLikeRepository.findOne({
      where: { feedId, userId },
    })
    if (existingLike) {
      throw new BadRequestException('已经点赞过该动态')
    }

    // 创建点赞记录
    const like = this.feedLikeRepository.create({
      feedId,
      userId,
    })

    const savedLike = await this.feedLikeRepository.save(like)

    // 更新动态点赞数
    await this.feedRepository.increment({ id: feedId }, 'likeCount', 1)

    return savedLike
  }

  // 取消点赞
  async unlikeFeed(feedId: string, userId: string): Promise<void> {
    const like = await this.feedLikeRepository.findOne({
      where: { feedId, userId },
    })

    if (!like) {
      throw new NotFoundException('未点赞该动态')
    }

    await this.feedLikeRepository.remove(like)

    // 更新动态点赞数
    await this.feedRepository.decrement({ id: feedId }, 'likeCount', 1)
  }

  // 获取用户社交统计
  async getSocialStats(userId: string): Promise<SocialStatsDto> {
    const [followingCount, followerCount, feedCount, totalLikes] = await Promise.all([
      this.followRepository.count({ where: { followerId: userId } }),
      this.followRepository.count({ where: { followingId: userId } }),
      this.feedRepository.count({ where: { userId, isVisible: true } }),
      this.feedRepository
        .createQueryBuilder('feed')
        .select('SUM(feed.likeCount)', 'total')
        .where('feed.userId = :userId', { userId })
        .getRawOne()
        .then(result => parseInt(result.total) || 0),
    ])

    return {
      followingCount,
      followerCount,
      feedCount,
      totalLikes,
    }
  }
}
