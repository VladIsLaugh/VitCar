import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  override canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(ctx);
  }

  // Never throw — just set req.user = undefined for unauthenticated requests
  override handleRequest<TUser>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
