import { IsNotEmpty, IsUrl, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUrlDto {
    @ApiProperty({ example: 'https://example.com/very-long-url-path' })
    @IsNotEmpty()
    @IsUrl({}, { message: 'Invalid URL format' })
    longUrl: string;

    @ApiPropertyOptional({ example: '2025-12-31T23:59:59.999Z' })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;
}

export class UrlResponseDto {
    @ApiProperty({ example: '123abc' })
    shortCode: string;

    @ApiProperty({ example: 'https://example.com/very-long-url-path' })
    longUrl: string;

    @ApiProperty({ example: 'https://short.url/123abc' })
    shortUrl: string;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiPropertyOptional({ example: '2025-12-31T23:59:59.999Z' })
    expiresAt?: Date;

    @ApiProperty({ example: 0 })
    clicks: number;
}

export class UrlStatsDto {
    @ApiProperty({ example: '123abc' })
    shortCode: string;

    @ApiProperty({ example: 'https://example.com/very-long-url-path' })
    longUrl: string;

    @ApiProperty({ example: 'https://short.url/123abc' })
    shortUrl: string;

    @ApiProperty({ example: 42 })
    clicks: number;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiPropertyOptional({ example: '2025-12-31T23:59:59.999Z' })
    expiresAt?: Date;
}