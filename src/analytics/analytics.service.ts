import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { UrlEntity } from '../url/entities/url.entity';
import { UrlStatsDto } from '../url/dto/url.dto';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(UrlEntity)
        private readonly urlRepository: Repository<UrlEntity>,
        private readonly configService: ConfigService,
    ) {}

    async getUrlStats(shortCode: string, userId: string): Promise<UrlStatsDto> {
        const url = await this.urlRepository.findOne({
            where: { shortCode, userId },
        });

        if (!url) {
            throw new NotFoundException(`URL with short code ${shortCode} not found or you don't have permission to view it`);
        }

        const baseUrl = this.configService.get<string>('BASE_URL');

        return {
            shortCode: url.shortCode,
            longUrl: url.longUrl,
            shortUrl: `${baseUrl}/${url.shortCode}`,
            clicks: url.clicks,
            createdAt: url.createdAt,
            expiresAt: url.expiresAt,
        };
    }

    async getUserStats(userId: string): Promise<any> {
        const totalUrls = await this.urlRepository.count({ where: { userId } });

        const clicksResult = await this.urlRepository
            .createQueryBuilder('url')
            .select('SUM(url.clicks)', 'totalClicks')
            .where('url.userId = :userId', { userId })
            .getRawOne();

        const totalClicks = parseInt(clicksResult.totalClicks) || 0;

        const mostClickedUrl = await this.urlRepository.findOne({
            where: { userId },
            order: { clicks: 'DESC' },
        });

        const mostRecentUrl = await this.urlRepository.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        const avgClicks = totalUrls > 0 ? totalClicks / totalUrls : 0;

        return {
            totalUrls,
            totalClicks,
            avgClicksPerUrl: avgClicks.toFixed(2),
            mostClickedUrl: mostClickedUrl ? {
                shortCode: mostClickedUrl.shortCode,
                clicks: mostClickedUrl.clicks,
                longUrl: mostClickedUrl.longUrl,
            } : null,
            mostRecentUrl: mostRecentUrl ? {
                shortCode: mostRecentUrl.shortCode,
                createdAt: mostRecentUrl.createdAt,
                longUrl: mostRecentUrl.longUrl,
            } : null,
        };
    }
}