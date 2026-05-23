import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(config: ConfigService) {
    super(config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      // Stop reconnecting after 3 attempts so a missing REDIS_URL doesn't
      // keep emitting error events that would crash the process.
      retryStrategy: (times) => (times >= 3 ? null : Math.min(times * 500, 2000)),
    });

    // Swallow connection errors — getCurrent/get callers already handle null.
    this.on('error', (err: Error) => {
      this.logger.debug(`Redis error (non-fatal): ${err.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.connect();
    } catch {
      this.logger.warn('Redis unavailable — caching disabled, app continues without it');
    }
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
