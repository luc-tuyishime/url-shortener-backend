import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UrlModule } from './url/url.module';
import { AnalyticsModule } from './analytics/analytics.module';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const databaseUrl = configService.get('DATABASE_URL');

                if (databaseUrl) {
                    return {
                        type: 'postgres',
                        url: databaseUrl,
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: configService.get('NODE_ENV', 'development') !== 'production',
                        ssl: true ? { rejectUnauthorized: false } : false,
                    };
                }

                return {
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_DATABASE', 'url_shortener'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV', 'development') !== 'production',
                    ssl: configService.get('DB_SSL', 'false') === 'true'
                        ? { rejectUnauthorized: false }
                        : false,
                };
            },
        }),

        // Rate limiting
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            // @ts-ignore
            useFactory: (configService: ConfigService) => ({
                ttl: configService.get('THROTTLE_TTL', 60),
                limit: configService.get('THROTTLE_LIMIT', 10),
            }),
        }),

        AuthModule,
        UserModule,
        UrlModule,
        AnalyticsModule,
    ],
})
export class AppModule {}