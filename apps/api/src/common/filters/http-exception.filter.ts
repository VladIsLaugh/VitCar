import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? ((exception.getResponse() as { message?: string | string[] })?.message ??
          exception.message)
        : 'Internal server error';

    const error = exception instanceof HttpException ? exception.name : 'InternalServerError';

    this.logger.error(
      `${request.method} ${request.url} → ${statusCode}`,
      exception instanceof Error ? exception.stack : String(exception)
    );

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
