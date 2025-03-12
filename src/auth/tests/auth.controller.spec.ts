import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard, JwtRefreshGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto, TokensDto } from '../dto/auth.dto';
import { UserEntity } from '../../user/entities/user.entity';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockUser: UserEntity = {
        id: '123',
        username: 'kigali',
        email: 'lucas@gmail.com',
        password: 'Voila123!!',
        first_name: null,
        last_name: null,
        profile_picture: null,
        provider: null,
        provider_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        urls: []
    };

    const mockTokens: TokensDto = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token'
    };


    const mockAuthService = {
        register: jest.fn().mockImplementation((dto) => {
            return Promise.resolve({ user_id: '123', message: 'User registered successfully' });
        }),
        login: jest.fn().mockResolvedValue(mockTokens),
        refreshTokens: jest.fn().mockResolvedValue(mockTokens),
        validateUser: jest.fn().mockResolvedValue(mockUser),
    };

    const mockConfigService = {
        get: jest.fn().mockImplementation((key) => {
            if (key === 'FRONTEND_URL') return 'http://localhost:3000';
            return 'mock_value';
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(JwtRefreshGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto: RegisterDto = {
                username: 'kigali',
                email: 'lucas@gmail.com',
                password: 'Password123!'
            };

            const result = await controller.register(registerDto);

            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual({ user_id: undefined, message: 'User registered successfully' });
        });
    });

    describe('login', () => {
        it('should login a user and return tokens', async () => {
            const loginDto: LoginDto = {
                username: 'kigali',
                password: 'Password123!'
            };

            const result = await controller.login(loginDto);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(mockTokens);
        });
    });

    describe('refreshTokens', () => {
        it('should refresh tokens', async () => {
            const result = await controller.refreshTokens(mockUser);

            expect(authService.refreshTokens).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockTokens);
        });
    });

    describe('logout', () => {
        it('should logout a user', async () => {
            const result = await controller.logout();

            expect(result).toEqual({ message: 'Logout successful' });
        });
    });

    describe('getProfile', () => {
        it('should return the user profile', () => {
            const result = controller.getProfile(mockUser);

            expect(result).toEqual(mockUser);
        });
    });
});