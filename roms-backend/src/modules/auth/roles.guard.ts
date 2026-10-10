import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { CASHIER_DEMO_READONLY_KEY } from './cashier-demo-readonly.decorator';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      method: string;
      user?: { role?: RoleName };
    }>();
    const isDemoReadonly = this.reflector.getAllAndOverride<boolean>(
      CASHIER_DEMO_READONLY_KEY,
      [context.getHandler()],
    );
    const isDemoBypassEnabled =
      this.config.get<string>('CASHIER_DEMO_AUTH_BYPASS') === 'true' &&
      this.config.get<string>('NODE_ENV') === 'development';
    if (isDemoBypassEnabled && request.method === 'GET' && isDemoReadonly) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    if (request.user?.role && roles.includes(request.user.role)) return true;
    throw new ForbiddenException(
      'Your role cannot access this cashier operation',
    );
  }
}
