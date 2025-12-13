// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from "@nestjs/config";
import { initializeEmail } from "@repo/auth";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false,
    });

    // Enable CORS
    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:3000', 'https://dev.orbis.place', 'https://orbis.place', 'https://www.orbis.place'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
    }));

    const configService = app.get(ConfigService);

    const isDev = process.env.NODE_ENV !== 'production';

    const resendApiKey = configService.get<string>('RESEND_API_KEY');

    if (!resendApiKey) {
        throw new Error('RESEND_API_KEY not found in .env');
    }

    initializeEmail(resendApiKey);

    const config = new DocumentBuilder()
        .setTitle('Orbis API')
        .setDescription('The Orbis API description')
        .setVersion('1.0')
        .addTag('Orbis')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();