// apps/api/src/main.ts
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ConfigService} from "@nestjs/config";
import {initializeEmail} from "@repo/auth";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false,
    });
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
    }));
    app.enableCors({
        origin: true,
        credentials: true,
    });


    const configService = app.get(ConfigService);
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

    await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();