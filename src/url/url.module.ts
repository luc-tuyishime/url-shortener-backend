import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { UrlEntity } from './entities/url.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UrlEntity])],
    controllers: [UrlController],
    providers: [UrlService],
    exports: [UrlService],
})
export class UrlModule {}
