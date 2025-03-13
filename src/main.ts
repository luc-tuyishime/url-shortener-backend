import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);


    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: process.env.FRONTEND_URL || 'https://url-shortener-frontend-wine.vercel.app',
        credentials: true,
    });

    app.use(cookieParser());

    const config = new DocumentBuilder()
        .setTitle('URL Shortener API')
        .setDescription('API for URL Shortener service with authentication')
        .setVersion('1.0')
        .addTag('auth')
        .addTag('urls')
        .addTag('analytics')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            basePath: '/api'
        }
    });


    await app.listen(process.env.PORT || 3001, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();