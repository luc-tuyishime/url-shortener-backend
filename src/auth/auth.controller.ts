import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus,  Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, TokensDto } from './dto/auth.dto';
import { JwtAuthGuard, JwtRefreshGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.register(registerDto);
        return { message: 'User registered successfully', userId: user.id };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with credentials' })
    @ApiResponse({ status: 200, description: 'User logged in successfully', type: TokensDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto): Promise<TokensDto> {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'New tokens generated successfully', type: TokensDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async refreshTokens(@GetUser() user: UserEntity): Promise<TokensDto> {
        return this.authService.refreshTokens(user.id);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user (invalidate tokens on client side)' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout() {
        // JWT tokens are stateless, so logout is handled on the client side
        // by removing the tokens from storage
        return { message: 'Logout successful' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user information' })
    @ApiResponse({ status: 200, description: 'Current user information' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getProfile(@GetUser() user: UserEntity) {
        return user;
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google OAuth login flow' })
    @ApiResponse({ status: 302, description: 'Redirect to Google login' })
    googleAuth() {
        // This route initiates the Google OAuth flow - handler logic is in the guard
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiExcludeEndpoint() // Hide from Swagger docs
    async googleAuthCallback(@Req() req, @Res() res) {
        const user = req.user;
        const tokens = await this.authService.generateTokens(user);

        // Redirect to frontend with tokens
        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        res.redirect(`${frontendUrl}/oauth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`);
    }
}