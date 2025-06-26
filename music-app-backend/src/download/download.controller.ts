import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { DownloadService } from './download.service'
import {
  CreateDownloadDto,
  UpdateDownloadDto,
  DownloadQueryDto,
  BatchDownloadDto,
  StorageStatsDto,
  CleanupOptionsDto,
} from '../dto'

@ApiTags('download')
@Controller('download')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post()
  @ApiOperation({ summary: '创建下载任务' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  async createDownload(@Body() createDownloadDto: CreateDownloadDto, @Request() req) {
    return await this.downloadService.createDownload(createDownloadDto, req.user.id)
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建下载任务' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createBatchDownload(@Body() batchDownloadDto: BatchDownloadDto, @Request() req) {
    return await this.downloadService.createBatchDownload(batchDownloadDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: '获取下载列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDownloads(@Query() query: DownloadQueryDto, @Request() req) {
    return await this.downloadService.getDownloads(query, req.user.id)
  }

  @Get('stats')
  @ApiOperation({ summary: '获取存储统计' })
  @ApiResponse({ status: 200, description: '获取成功', type: StorageStatsDto })
  async getStorageStats(@Request() req): Promise<StorageStatsDto> {
    return await this.downloadService.getStorageStats(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取下载详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '下载任务不存在' })
  async getDownload(@Param('id') id: string, @Request() req) {
    return await this.downloadService.getDownload(id, req.user.id)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新下载任务' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '下载任务不存在' })
  async updateDownload(
    @Param('id') id: string,
    @Body() updateDownloadDto: UpdateDownloadDto,
    @Request() req,
  ) {
    return await this.downloadService.updateDownload(id, updateDownloadDto, req.user.id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除下载任务' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '下载任务不存在' })
  async deleteDownload(@Param('id') id: string, @Request() req) {
    await this.downloadService.deleteDownload(id, req.user.id)
  }

  @Put(':id/pause')
  @ApiOperation({ summary: '暂停下载' })
  @ApiResponse({ status: 200, description: '暂停成功' })
  @ApiResponse({ status: 404, description: '下载任务不存在' })
  async pauseDownload(@Param('id') id: string, @Request() req) {
    return await this.downloadService.pauseDownload(id, req.user.id)
  }

  @Put(':id/resume')
  @ApiOperation({ summary: '恢复下载' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  @ApiResponse({ status: 404, description: '下载任务不存在' })
  async resumeDownload(@Param('id') id: string, @Request() req) {
    return await this.downloadService.resumeDownload(id, req.user.id)
  }

  @Put(':id/retry')
  @ApiOperation({ summary: '重试下载' })
  @ApiResponse({ status: 200, description: '重试成功' })
  @ApiResponse({ status: 404, description: '下载任务不存在' })
  async retryDownload(@Param('id') id: string, @Request() req) {
    return await this.downloadService.retryDownload(id, req.user.id)
  }

  @Post('cleanup')
  @ApiOperation({ summary: '清理下载文件' })
  @ApiResponse({ status: 200, description: '清理成功' })
  @ApiResponse({ status: 400, description: '用户未启用自动清理' })
  async cleanupDownloads(@Body() options: CleanupOptionsDto, @Request() req) {
    return await this.downloadService.cleanupDownloads(req.user.id, options)
  }
}
