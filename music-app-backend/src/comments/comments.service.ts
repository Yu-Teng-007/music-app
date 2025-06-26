import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from '../entities/comment.entity'
import { CreateCommentDto, UpdateCommentDto, QueryCommentsDto } from '../dto/comment.dto'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    })
    return await this.commentRepository.save(comment)
  }

  async findAll(queryDto: QueryCommentsDto) {
    const { songId, userId, page = 1, limit = 20 } = queryDto

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .select(['comment', 'user.id', 'user.username', 'user.avatarUrl'])
      .orderBy('comment.createdAt', 'DESC')

    if (songId) {
      queryBuilder.andWhere('comment.songId = :songId', { songId })
    }

    if (userId) {
      queryBuilder.andWhere('comment.userId = :userId', { userId })
    }

    // 分页
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    const [comments, total] = await queryBuilder.getManyAndCount()

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!comment) {
      throw new NotFoundException('评论不存在')
    }

    return comment
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id)

    // 验证是否为评论作者
    if (comment.userId !== userId) {
      throw new ForbiddenException('无权修改他人评论')
    }

    Object.assign(comment, updateCommentDto)
    return await this.commentRepository.save(comment)
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id)

    // 验证是否为评论作者
    if (comment.userId !== userId) {
      throw new ForbiddenException('无权删除他人评论')
    }

    await this.commentRepository.remove(comment)
  }

  async likeComment(id: string): Promise<Comment> {
    const comment = await this.findOne(id)
    comment.likes += 1
    return await this.commentRepository.save(comment)
  }
}
