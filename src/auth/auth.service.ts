import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, TokensDto } from './dto/auth.dto';
import { UserEntity } from '../user/entities/user.entity';
import { OAuthUser } from './dto/oauth-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(registerDto: RegisterDto): Promise<UserEntity> {
        // Check if user exists
        const userExists = await this.userService.findByEmail(registerDto.email);
        if (userExists) {
            throw new ConflictException('User with this email already exists');
        }

        const usernameExists = await this.userService.findByUsername(registerDto.username);
        if (usernameExists) {
            throw new ConflictException('User with this username already exists');
        }

        // Hash password
        const hashedPassword = await this.hashPassword(registerDto.password);

        // Create user
        return this.userService.create({
            ...registerDto,
            password: hashedPassword,
        });
    }

    async login(loginDto: LoginDto): Promise<TokensDto> {
        // Find user by email or username
        const user = await this.userService.findByUsernameOrEmail(loginDto.username);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const passwordMatches = await this.verifyPassword(user.password, loginDto.password);

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return tokens;
    }

    async refreshTokens(userId: string): Promise<TokensDto> {
        const user = await this.userService.findOne(userId);

        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        return this.generateTokens(user);
    }

    async validateOAuthUser(oauthUser: OAuthUser): Promise<UserEntity> {
        // Check if user exists by OAuth provider and ID
        let user = await this.userService.findByProviderAndProviderId(
            oauthUser.provider,
            oauthUser.providerId,
        );

        // If user doesn't exist, check by email
        if (!user) {
            user = await this.userService.findByEmail(oauthUser.email);

            // If user exists by email, update with OAuth info
            if (user) {
                user.provider = oauthUser.provider;
                user.providerId = oauthUser.providerId;

                // Update other profile info if provided
                if (oauthUser.firstName) user.firstName = oauthUser.firstName;
                if (oauthUser.lastName) user.lastName = oauthUser.lastName;
                if (oauthUser.picture) user.profilePicture = oauthUser.picture;

                return this.userService.save(user);
            }

            // If user doesn't exist at all, create a new one
            const username = await this.generateUniqueUsername(oauthUser.email);

            return this.userService.create({
                username,
                email: oauthUser.email,
                password: null, // No password for OAuth users
                provider: oauthUser.provider,
                providerId: oauthUser.providerId,
                firstName: oauthUser.firstName,
                lastName: oauthUser.lastName,
                profilePicture: oauthUser.picture,
            });
        }

        return user;
    }

    private async generateUniqueUsername(email: string): Promise<string> {
        // Generate username from email (e.g., johndoe@example.com -> johndoe)
        let username = email.split('@')[0].toLowerCase();

        // Check if username exists
        const userExists = await this.userService.findByUsername(username);

        // If username exists, append random numbers
        if (userExists) {
            const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit number
            username = `${username}${randomSuffix}`;
        }

        return username;
    }

    async generateTokens(user: UserEntity): Promise<TokensDto> {
        const payload = { sub: user.id, email: user.email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }


    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    private async verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}