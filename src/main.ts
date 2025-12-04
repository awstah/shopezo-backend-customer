import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const port = process.env.PORT || 3000;
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({
        origin: [
            "https://shopezo-hqjayfzoj-awstahs-projects.vercel.app",
            "http://localhost:3000",
            "https://shopezo-web.vercel.app",
            "https://www.shopezo.ae",
            "https://shopezo.ae"
        ]
    });
    const options = new DocumentBuilder()
        .setTitle('Shopezo API')
        .setDescription('API documentation for the Shopezo project')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey(
            {
                type: 'apiKey',
                name: 'x-channel-id',
                in: 'header',
                description: '001 for Web and 002 for Mobile',
            },
            'x-channel-id',
        )
        .addApiKey(
            {
                type: 'apiKey',
                name: 'user_time_zone',
                in: 'header',
                description:
                    'Timezone in IANA format (e.g., Asia/Karachi, America/New_York)',
            },
            'user_time_zone',
        )
        // .addGlobalParameters({
        //     in: 'header',
        //     name: 'user_time_zone',
        //     description:
        //         'Timezone in IANA format (e.g., Asia/Karachi, America/New_York)',
        //     schema: {
        //         type: 'string',
        //         default: 'Asia/Karachi',
        //     },
        // })
        // .addGlobalParameters({
        //     in: 'header',
        //     name: 'x-channel-id',
        //     description: '001 for Web and 002 for Mobile',
        //     schema: {
        //         type: 'string',
        //         default: '001',
        //     },
        // })
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
    await app.listen(port);
    console.log(`Server is running on the port ${port}`);
    console.log(`Connected to DB: ${process.env.DB_NAME}`);
}
bootstrap();
