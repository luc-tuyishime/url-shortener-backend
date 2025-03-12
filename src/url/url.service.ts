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
        const { longUrl, expiresAt } = createUrlDto;

        // Generate a unique short code
        const shortCodeLength = this.configService.get<number>('SHORT_URL_LENGTH', 6);
        const shortCode = nanoid(shortCodeLength);

        // Create and save the URL entity
        const urlEntity = this.urlRepository.create({
            shortCode,
            longUrl,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            userId: user.id,
        });

        const savedUrl = await this.urlRepository.save(urlEntity);

        // Return the response with the full short URL
        return this.mapEntityToResponseDto(savedUrl);
    }

    async findAll(userId: string): Promise<UrlResponseDto[]> {
        const urls = await this.urlRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        return urls.map(url => this.mapEntityToResponseDto(url));
    }

    async incrementClicks(shortCode: string): Promise<void> {
        await this.urlRepository.increment({ shortCode }, 'clicks', 1);
    }

    async delete(shortCode: string, userId: string): Promise<void> {
        const result = await this.urlRepository.delete({
            shortCode,
            userId,
        });

        if (result.affected === 0) {
            throw new NotFoundException(`URL with short code ${shortCode} not found or you don't have permission to delete it`);
        }
    }

    private mapEntityToResponseDto(urlEntity: UrlEntity): UrlResponseDto {
        const baseUrl = this.configService.get<string>('BASE_URL');

        return {
            shortCode: urlEntity.shortCode,
            longUrl: urlEntity.longUrl,
            shortUrl: `${baseUrl}/${urlEntity.shortCode}`,
            createdAt: urlEntity.createdAt,
            expiresAt: urlEntity.expiresAt,
            clicks: urlEntity.clicks,
        };
    }
}