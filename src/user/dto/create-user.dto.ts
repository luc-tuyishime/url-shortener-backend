import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'johndoe' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    username: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'P@ssw0rd123' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}