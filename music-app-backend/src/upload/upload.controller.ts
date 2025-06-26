import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('music')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传音乐文件', description: '上传音乐文件到服务器' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '音乐文件',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '音乐文件（支持mp3, wav, flac等格式）',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '音乐文件上传成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', description: '文件名' },
            originalName: { type: 'string', description: '原始文件名' },
            path: { type: 'string', description: '文件路径' },
            url: { type: 'string', description: '文件访问URL' },
            size: { type: 'number', description: '文件大小（字节）' },
            mimetype: { type: 'string', description: '文件类型' },
          },
        },
        message: { type: 'string', example: '音乐文件上传成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误或文件格式不支持' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 413, description: '文件大小超出限制' })
  async uploadMusic(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('请选择要上传的音乐文件')
    }

    const result = this.uploadService.uploadMusic(file)
    return {
      success: true,
      data: result,
      message: '音乐文件上传成功',
    }
  }

  @Post('cover')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传封面图片', description: '上传歌曲或专辑封面图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '封面图片文件',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '图片文件（支持jpg, png, gif等格式）',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '封面图片上传成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string', description: '文件名' },
            originalName: { type: 'string', description: '原始文件名' },
            path: { type: 'string', description: '文件路径' },
            url: { type: 'string', description: '文件访问URL' },
            size: { type: 'number', description: '文件大小（字节）' },
            mimetype: { type: 'string', description: '文件类型' },
          },
        },
        message: { type: 'string', example: '封面图片上传成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误或文件格式不支持' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 413, description: '文件大小超出限制' })
  async uploadCover(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('请选择要上传的封面图片')
    }

    const result = this.uploadService.uploadCover(file)
    return {
      success: true,
      data: result,
      message: '封面图片上传成功',
    }
  }
}
