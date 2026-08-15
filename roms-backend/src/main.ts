import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình Prefix API toàn hệ thống (/api/v1/...)
  app.setGlobalPrefix('api/v1');

  // 2. Bật CORS cho phép Web (5173) và Mobile truy cập
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Cấu hình Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field thừa không có trong DTO
      transform: true, // Tự động convert kiểu dữ liệu (String -> Number...)
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Cấu hình Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('ROMS API Specifications')
    .setDescription('Restaurant Operations Management System API Documentation')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(
    `🚀 Server ROMS Backend running on: http://localhost:${port}/api/v1`,
  );
  logger.log(
    `📚 Swagger OpenAPI Documentation: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
