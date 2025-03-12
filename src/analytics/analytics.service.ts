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

    async getUrlStats(short_code: string, user_id: string): Promise<UrlStatsDto> {
        const url = await this.urlRepository.findOne({
            where: { short_code, user_id },
        });

        if (!url) {
            throw new NotFoundException(`URL with short code ${short_code} not found or you don't have permission to view it`);
        }

        const baseUrl = this.configService.get<string>('BASE_URL');

        return {
            short_code: url.short_code,
            long_url: url.long_url,
            shortUrl: `${baseUrl}/${url.short_code}`,
            clicks: url.clicks,
            created_at: url.created_at,
            expires_at: url.expires_at,
        };
    }

    async getUserStats(user_id: string): Promise<any> {
        const totalUrls = await this.urlRepository.count({ where: { user_id } });

        const clicksResult = await this.urlRepository
            .createQueryBuilder('url')
            .select('SUM(url.clicks)', 'totalClicks')
            .where('url.user_id = :user_id', { user_id })
            .getRawOne();

        const totalClicks = parseInt(clicksResult.totalClicks) || 0;

        const mostClickedUrl = await this.urlRepository.findOne({
            where: { user_id },
            order: { clicks: 'DESC' },
        });

        const mostRecentUrl = await this.urlRepository.findOne({
            where: { user_id },
            order: { created_at: 'DESC' },
        });

        const avgClicks = totalUrls > 0 ? totalClicks / totalUrls : 0;

        return {
            totalUrls,
            totalClicks,
            avgClicksPerUrl: avgClicks.toFixed(2),
            mostClickedUrl: mostClickedUrl ? {
                short_code: mostClickedUrl.short_code,
                clicks: mostClickedUrl.clicks,
                long_url: mostClickedUrl.long_url,
            } : null,
            mostRecentUrl: mostRecentUrl ? {
                short_code: mostRecentUrl.short_code,
                created_at: mostRecentUrl.created_at,
                long_url: mostRecentUrl.long_url,
            } : null,
        };
    }
}