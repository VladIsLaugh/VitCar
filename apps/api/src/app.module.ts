import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CalculatorModule } from './modules/calculator/calculator.module';
import { DebugModule } from './modules/debug/debug.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    CalculatorModule,
    DebugModule,
  ],
})
export class AppModule {}
