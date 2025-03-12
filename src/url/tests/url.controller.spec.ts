import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from '../url.controller';
import { UrlService } from '../url.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateUrlDto, UrlResponseDto } from '../dto/url.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { UrlEntity } from '../entities/url.entity';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UrlController', () => {
    let controller: UrlController;
    let urlService: UrlService;

    const mockUser: UserEntity = {
        id: '123',
        username: 'lucas',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: null,
        lastName: null,
        profilePicture: null,
        provider: null,
        providerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        urls: []
    };

    const mockUrlResponse: UrlResponseDto = {
        shortCode: 'abc123',
        longUrl: 'https://example.com/test',
        shortUrl: 'http://localhost:3001/abc123',
        createdAt: new Date(),
        clicks: 0
    };


    const mockUrlEntity: UrlEntity = {
        id: '456',
        shortCode: 'abc123',
        longUrl: 'https://example.com/test',
        clicks: 0,
        createdAt: new Date(),
        expiresAt: null,
        user: mockUser,
        userId: mockUser.id
    };

    // Mock URL service
    const mockUrlService = {
        create: jest.fn().mockResolvedValue(mockUrlResponse),
        findAll: jest.fn().mockResolvedValue([mockUrlResponse]),
        findByShortCode: jest.fn().mockResolvedValue(mockUrlEntity),
        incrementClicks: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined)
    };

    // Mock response object
    const mockResponse = {
        redirect: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UrlController],
            providers: [
                { provide: UrlService, useValue: mockUrlService }
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<UrlController>(UrlController);
        urlService = module.get<UrlService>(UrlService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a shortened URL', async () => {
            const createUrlDto: CreateUrlDto = {
                longUrl: 'https://example.com/test'
            };

            const result = await controller.create(createUrlDto, mockUser);

            expect(urlService.create).toHaveBeenCalledWith(createUrlDto, mockUser);
            expect(result).toEqual(mockUrlResponse);
        });
    });

    describe('findAll', () => {
        it('should return all URLs for the user', async () => {
            const result = await controller.findAll(mockUser);

            expect(urlService.findAll).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual([mockUrlResponse]);
        });
    });

    describe('delete', () => {
        it('should delete a shortened URL', async () => {
            await controller.delete('abc123', mockUser);

            expect(urlService.delete).toHaveBeenCalledWith('abc123', mockUser.id);
        });
    });
});