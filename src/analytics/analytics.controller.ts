import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { UrlStatsDto } from '../url/dto/url.dto';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get(':short_code')
    @ApiOperation({ summary: 'Get analytics for a specific shortened URL' })
    @ApiResponse({ status: 200, description: 'URL analytics retrieved successfully', type: UrlStatsDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'URL not found' })
    async getUrlStats(
        @Param('short_code') short_code: string,
        @GetUser() user: UserEntity,
    ): Promise<UrlStatsDto> {
        return this.analyticsService.getUrlStats(short_code, user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get overall analytics for the user' })
    @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getUserStats(@GetUser() user: UserEntity): Promise<any> {
        return this.analyticsService.getUserStats(user.id);
    }
}