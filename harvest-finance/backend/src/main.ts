import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import { CustomLoggerService } from './logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const customLogger = app.get(CustomLoggerService);
  app.useLogger(customLogger);
  app.useGlobalFilters(
    new HttpExceptionFilter(customLogger),
    new ThrottlerExceptionFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Harvest Finance API')
    .setDescription(
      'Harvest Finance - Agricultural Marketplace API\n\n' +
        '## Features\n' +
        '- JWT Authentication with RBAC\n' +
        '- User roles: FARMER, BUYER, INSPECTOR, ADMIN\n' +
        '- Secure login and registration\n' +
        '- Token refresh and logout\n' +
        '- Password reset functionality\n' +
        '- Rate limiting\n' +
        '- Delivery verification with GPS coordinates\n' +
        '- IPFS image storage for proof of delivery\n' +
        '- Multi-signature approval workflow\n' +
        '- Automatic payment release on verification\n' +
        '- Real-time notifications\n' +
        '- Inspector assignment management',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('verifications', 'Delivery verification endpoints')
    .addTag('deliveries', 'Delivery management endpoints')
    .addTag('orders', 'Order management endpoints')
    .addTag('health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
