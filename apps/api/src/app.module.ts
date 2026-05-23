import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CalculatorModule } from './modules/calculator/calculator.module';
import { LotsModule } from './modules/lots/lots.module';
import { DebugModule } from './modules/debug/debug.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CalculatorModule,
    LotsModule,
    DebugModule,
    VehiclesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
