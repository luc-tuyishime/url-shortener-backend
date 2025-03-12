import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { UrlService } from './url.service';
import { CreateUrlDto, UrlResponseDto } from './dto/url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@ApiTags('urls')
@Controller()
export class UrlController {
    constructor(private readonly urlService: UrlService) {}

    @Post('shorten')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a shortened URL' })
    @ApiResponse({ status: 201, description: 'URL shortened successfully', type: UrlResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid URL format' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(
        @Body() createUrlDto: CreateUrlDto,
        @GetUser() user: UserEntity,
    ): Promise<UrlResponseDto> {
        return this.urlService.create(createUrlDto, user);
    }

    @Get('urls')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all URLs for the authenticated user' })
    @ApiResponse({ status: 200, description: 'URLs retrieved successfully', type: [UrlResponseDto] })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@GetUser() user: UserEntity): Promise<UrlResponseDto[]> {
        return this.urlService.findAll(user.id);
    }


    @Delete('urls/:shortCode')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a shortened URL' })
    @ApiResponse({ status: 204, description: 'URL deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'URL not found' })
    async delete(
        @Param('shortCode') shortCode: string,
        @GetUser() user: UserEntity,
    ): Promise<void> {
        await this.urlService.delete(shortCode, user.id);
    }
}