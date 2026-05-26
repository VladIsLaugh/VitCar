import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  // Try to authenticate; if no token or invalid token, allow through with req.user = undefined.
  // Using try-catch instead of handleRequest override because super.canActivate() can throw
  // synchronously for malformed tokens before handleRequest is ever called.
  override async canActivate(ctx: ExecutionContext): Promise<boolean> {
    try {
      await (super.canActivate(ctx) as Promise<boolean>);
    } catch {
      // unauthenticated — req.user stays undefined
    }
    return true;
  }
}
