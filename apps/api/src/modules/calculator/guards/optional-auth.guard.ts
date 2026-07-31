import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  // Combination approach: handleRequest suppresses the throw so super.canActivate()
  // always resolves (never rejects), letting @nestjs/passport set request.user = false
  // for unauthenticated requests. The try-catch is a safety net for any unexpected
  // internal passport errors (e.g. passport calling next(err)).
  override async canActivate(ctx: ExecutionContext): Promise<boolean> {
    try {
      await (super.canActivate(ctx) as Promise<boolean>);
    } catch {
      // passport internal error — req.user stays undefined, allow through
    }
    return true;
  }

  // Return user as-is instead of throwing — unauthenticated requests get
  // req.user = false/undefined rather than an UnauthorizedException.
  override handleRequest<TUser>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
