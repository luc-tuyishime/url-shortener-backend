import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'jeanluc' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    username: string;

    @ApiProperty({ example: 'jeanluc@gmail.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Test123!' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number or special character',
    })
    password: string;
}

export class LoginDto {
    @ApiProperty({ example: 'jeanluc@gmail.com' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ example: 'Test123!' })
    @IsNotEmpty()
    @IsString()
    password: string;
}

export class TokensDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}