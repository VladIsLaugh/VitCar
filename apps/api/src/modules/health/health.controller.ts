import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      environment: process.env['APP_ENV'] ?? 'unknown',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '0.1.0',
    };
  }

  @Get('db')
  checkDb() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'pending — Prisma not yet configured',
    };
  }
}
