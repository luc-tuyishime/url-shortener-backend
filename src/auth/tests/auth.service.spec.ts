import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { UserEntity } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser: UserEntity = {
        id: '123',
        username: 'lucas',
        email: 'test@gmail.com',
        password: 'Test@123!',
        first_name: null,
        last_name: null,
        profile_picture: null,
        provider: null,
        provider_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        urls: []
    };

    const mockUserService = {
        create: jest.fn().mockResolvedValue(mockUser),
        findOne: jest.fn().mockResolvedValue(mockUser),
        findByEmail: jest.fn().mockResolvedValue(null),
        findByUsername: jest.fn().mockResolvedValue(null),
        findByUsernameOrEmail: jest.fn().mockResolvedValue(mockUser),
        save: jest.fn().mockResolvedValue(mockUser)
    };

    const mockJwtService = {
        signAsync: jest.fn().mockImplementation((payload, options) => {
            return Promise.resolve(options?.secret === 'access_secret' ? 'access_token' : 'refresh_token');
        })
    };

    const mockConfigService = {
        get: jest.fn().mockImplementation((key) => {
            if (key === 'JWT_ACCESS_SECRET') return 'access_secret';
            if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
            if (key === 'JWT_ACCESS_EXPIRATION') return '15m';
            if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
            return 'mock_value';
        })
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: mockUserService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService }
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);

        // Mock bcrypt implementations
        (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto: RegisterDto = {
                username: 'lucas',
                email: 'test@gmail.com',
                password: 'Password123!'
            };

            const result = await service.register(registerDto);

            expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
            expect(userService.findByUsername).toHaveBeenCalledWith(registerDto.username);
            expect(bcrypt.genSalt).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 'salt');
            expect(userService.create).toHaveBeenCalledWith({
                ...registerDto,
                password: 'hashedPassword'
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw ConflictException if email already exists', async () => {
            const registerDto: RegisterDto = {
                username: 'lucas',
                email: 'existing@example.com',
                password: 'Password123!'
            };

            // Mock existing email
            mockUserService.findByEmail.mockResolvedValueOnce(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if username already exists', async () => {
            const registerDto: RegisterDto = {
                username: 'pierre',
                email: 'test@gmail.com',
                password: 'Password123!'
            };

            mockUserService.findByUsername.mockResolvedValueOnce(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should login a user and return tokens', async () => {
            const loginDto: LoginDto = {
                username: 'lucas',
                password: 'Password123!'
            };

            const result = await service.login(loginDto);

            expect(userService.findByUsernameOrEmail).toHaveBeenCalledWith(loginDto.username);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                accessToken: 'access_token',
                refreshToken: 'refresh_token'
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const loginDto: LoginDto = {
                username: 'nonexistent',
                password: 'Password123!'
            };

            // Mock user not found
            mockUserService.findByUsernameOrEmail.mockResolvedValueOnce(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const loginDto: LoginDto = {
                username: 'lucas',
                password: 'WrongPassword!'
            };

            (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refreshTokens', () => {
        it('should refresh tokens', async () => {
            const result = await service.refreshTokens(mockUser.id);

            expect(userService.findOne).toHaveBeenCalledWith(mockUser.id);
            expect(jwtService.signAsync).toHaveBeenCalled();
            expect(result).toEqual({
                accessToken: 'access_token',
                refreshToken: 'refresh_token'
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockUserService.findOne.mockResolvedValueOnce(null);

            await expect(service.refreshTokens('nonexistent')).rejects.toThrow(UnauthorizedException);
        });
    });
});