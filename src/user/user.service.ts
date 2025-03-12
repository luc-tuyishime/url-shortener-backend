import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async create(createUserDto: any): Promise<UserEntity> {
        const user = this.userRepository.create(createUserDto);
        // @ts-ignore
        return this.userRepository.save(user);
    }

    async save(user: UserEntity): Promise<UserEntity> {
        return this.userRepository.save(user);
    }

    async findOne(id: string): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findByUsername(username: string): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { username } });
    }

    async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserEntity> {
        return this.userRepository.findOne({
            where: [
                { username: usernameOrEmail },
                { email: usernameOrEmail },
            ],
        });
    }

    async findByProviderAndProviderId(provider: string, providerId: string): Promise<UserEntity> {
        return this.userRepository.findOne({
            where: {
                provider,
                providerId,
            },
        });
    }
}