import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { UrlEntity } from './entities/url.entity';
import { CreateUrlDto, UrlResponseDto } from './dto/url.dto';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class UrlService {
    constructor(
        @InjectRepository(UrlEntity)
        private readonly urlRepository: Repository<UrlEntity>,
        private readonly configService: ConfigService,
    ) {}

    async create(
        createUrlDto: CreateUrlDto,
        user: UserEntity,
    ): Promise<UrlResponseDto> {
        const { long_url, expires_at } = createUrlDto;

        const shortCodeLength = this.configService.get<number>('SHORT_URL_LENGTH', 6);
        const short_code = nanoid(shortCodeLength);

        // @ts-ignore
        const urlEntity = this.urlRepository.create({
            short_code,
            long_url,
            expiresAt: expires_at ? new Date(expires_at) : null,
            user_id: user.id,
        });

        const savedUrl: any = await this.urlRepository.save(urlEntity);

        return this.mapEntityToResponseDto(savedUrl);
    }

    async findAll(user_id: string): Promise<UrlResponseDto[]> {
        const urls = await this.urlRepository.find({
            where: { user_id },
            order: { created_at: 'DESC' },
        });

        return urls.map(url => this.mapEntityToResponseDto(url));
    }

    async findByShortCode(short_code: string): Promise<UrlEntity> {
        const url = await this.urlRepository.findOne({
            where: { short_code },
        });

        if (!url) {
            throw new NotFoundException(`URL with short code ${short_code} not found`);
        }

        if (url.expires_at && new Date() > url.expires_at) {
            throw new BadRequestException('URL has expired');
        }

        return url;
    }

    async incrementClicks(short_code: string): Promise<void> {
        await this.urlRepository.increment({ short_code }, 'clicks', 1);
    }

    async delete(short_code: string, user_id: string): Promise<void> {
        const result = await this.urlRepository.delete({
            short_code,
            user_id,
        });

        if (result.affected === 0) {
            throw new NotFoundException(`URL with short code ${short_code} not found or you don't have permission to delete it`);
        }
    }

    private mapEntityToResponseDto(urlEntity: UrlEntity): UrlResponseDto {
        try {
            const originalUrl = new URL(urlEntity.long_url);
            const domain = `${originalUrl.protocol}//${originalUrl.hostname}`;

            const shortUrl = `${domain}/${urlEntity.short_code}`;

            return {
                short_code: urlEntity.short_code,
                long_url: urlEntity.long_url,
                short_url: shortUrl,
                created_at: urlEntity.created_at,
                expires_at: urlEntity.expires_at,
                clicks: urlEntity.clicks,
            };
        } catch (error) {
            const baseUrl = this.configService.get<string>('BASE_URL');

            return {
                short_code: urlEntity.short_code,
                long_url: urlEntity.long_url,
                short_url: `${baseUrl}/${urlEntity.short_code}`,
                created_at: urlEntity.created_at,
                expires_at: urlEntity.expires_at,
                clicks: urlEntity.clicks,
            };
        }
    }
}