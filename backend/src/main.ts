import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads and uploads/products directories exist locally
  const uploadsDir = join(process.cwd(), 'uploads');
  const productsUploadsDir = join(uploadsDir, 'products');
  if (!fs.existsSync(productsUploadsDir)) {
    fs.mkdirSync(productsUploadsDir, { recursive: true });
    logger.log(`Created uploads storage directory: ${productsUploadsDir}`);
  }

  // Serve static uploaded assets directly at /uploads and /api/uploads
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });
  app.useStaticAssets(uploadsDir, {
    prefix: '/api/uploads/',
  });

  // Global prefix for all API routes
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API Documentation setup
  const config = new DocumentBuilder()
    .setTitle('Point of Sale (POS) API')
    .setDescription('NestJS REST API documentation for POS System')
    .setVersion('1.0')
    .addTag('System')
    .addTag('POS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 POS Backend server is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger documentation available at: http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
