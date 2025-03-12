import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';

export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext): UserEntity => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);