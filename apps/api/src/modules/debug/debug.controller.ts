import { Controller, Get } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Controller('debug')
export class DebugController {
  @Get('error')
  triggerError() {
    const error = new Error('Test Sentry — intentional error from /api/debug/error');
    Sentry.captureException(error);
    throw error;
  }

  @Get('sentry')
  captureSentry() {
    Sentry.captureMessage('Test Sentry message from /api/debug/sentry', 'info');
    return { captured: true, message: 'Sentry test message sent' };
  }
}
