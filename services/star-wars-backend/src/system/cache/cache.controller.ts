import {
  Controller,
  Delete,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { CacheManagerService, CacheStats } from './cache-manager.service';

class ClearCacheByPatternDto {
  @ApiProperty({
    description: 'Pattern to match cache keys',
    example: 'user:*',
  })
  pattern: string;
}

@ApiTags('Cache')
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheManagerService: CacheManagerService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
  })
  async getCacheStats(): Promise<CacheStats> {
    return this.cacheManagerService.getCacheStats();
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all caches' })
  @ApiResponse({
    status: 204,
    description: 'All caches cleared successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearAllCaches(): Promise<void> {
    await this.cacheManagerService.clearAllCaches();
  }

  @Post('clear/pattern')
  @ApiOperation({ summary: 'Clear caches by pattern' })
  @ApiBody({
    description: 'Pattern to match cache keys',
    type: ClearCacheByPatternDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Caches cleared by pattern successfully',
  })
  async clearCachesByPattern(
    @Body() dto: ClearCacheByPatternDto,
  ): Promise<{ clearedCount: number }> {
    const clearedCount = await this.cacheManagerService.clearCachesByPattern(
      dto.pattern,
    );
    return { clearedCount };
  }
}
