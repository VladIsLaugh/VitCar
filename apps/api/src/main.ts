import './instrument';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  const allowedOrigins = new Set(
    [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean)
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow same-origin / server-to-server requests (no Origin header)
      if (!origin) return callback(null, true);
      // Allow explicitly configured frontend URL + localhost
      if (allowedOrigins.has(origin)) return callback(null, true);
      // Allow all Vercel preview deployments (*.vercel.app)
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`API running on: http://localhost:${port}/api`);
}

bootstrap();
