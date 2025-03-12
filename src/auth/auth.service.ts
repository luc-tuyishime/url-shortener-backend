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
        const userExists = await this.userService.findByEmail(registerDto.email);
        if (userExists) {
            throw new ConflictException('User with this email already exists');
        }

        const usernameExists = await this.userService.findByUsername(registerDto.username);
        if (usernameExists) {
            throw new ConflictException('User with this username already exists');
        }

        const hashedPassword = await this.hashPassword(registerDto.password);

        return this.userService.create({
            ...registerDto,
            password: hashedPassword,
        });
    }

    async login(loginDto: LoginDto): Promise<TokensDto> {
        const user = await this.userService.findByUsernameOrEmail(loginDto.username);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await this.verifyPassword(user.password, loginDto.password);

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user);

        return tokens;
    }

    async refreshTokens(user_id: string): Promise<TokensDto> {
        const user = await this.userService.findOne(user_id);

        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        return this.generateTokens(user);
    }

    async validateOAuthUser(oauthUser: OAuthUser): Promise<UserEntity> {
        let user = await this.userService.findByProviderAndprovider_id(
            oauthUser.provider,
            oauthUser.provider_id,
        );

        if (!user) {
            user = await this.userService.findByEmail(oauthUser.email);

            if (user) {
                user.provider = oauthUser.provider;
                user.provider_id = oauthUser.provider_id;

                if (oauthUser.first_name) user.first_name = oauthUser.first_name;
                if (oauthUser.last_name) user.last_name = oauthUser.last_name;
                if (oauthUser.picture) user.profile_picture = oauthUser.picture;

                return this.userService.save(user);
            }

            const username = await this.generateUniqueUsername(oauthUser.email);

            return this.userService.create({
                username,
                email: oauthUser.email,
                password: null,
                provider: oauthUser.provider,
                provider_id: oauthUser.provider_id,
                first_name: oauthUser.first_name,
                last_name: oauthUser.last_name,
                profile_picture: oauthUser.picture,
            });
        }

        return user;
    }

    private async generateUniqueUsername(email: string): Promise<string> {
        let username = email.split('@')[0].toLowerCase();

        const userExists = await this.userService.findByUsername(username);

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