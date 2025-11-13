import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('My List API')
    .setDescription("API for managing user's favorite movies and TV shows list")
    .setVersion('1.0')
    .addTag('mylist', 'Operations for managing user lists')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || process.env.SERVICE_PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
  console.log(`Swagger documentation available at: /api`);
}

bootstrap();
