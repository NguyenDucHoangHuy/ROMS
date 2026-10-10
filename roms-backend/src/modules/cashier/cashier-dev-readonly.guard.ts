import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  CASHIER_DEMO_EXECUTION_CONTEXT,
  CASHIER_DEMO_MUTATION_KEY,
  CASHIER_DEMO_READONLY_KEY,
} from '../auth/cashier-demo-readonly.decorator';

@Injectable()
export class CashierDevReadonlyAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isDemoReadonly = this.reflector.getAllAndOverride<boolean>(
      CASHIER_DEMO_READONLY_KEY,
      [context.getHandler()],
    );
    const isDemoMutation = this.reflector.getAllAndOverride<boolean>(
      CASHIER_DEMO_MUTATION_KEY,
      [context.getHandler()],
    );
    const request = context.switchToHttp().getRequest<{ method: string }>();
    const isDemoBypassEnabled =
      this.config.get<string>('CASHIER_DEMO_AUTH_BYPASS') === 'true' &&
      this.config.get<string>('NODE_ENV') === 'development';
    const allowedDemoRead = request.method === 'GET' && isDemoReadonly;
    const allowedDemoMutation =
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
      isDemoMutation;

    if (isDemoBypassEnabled && (allowedDemoRead || allowedDemoMutation)) {
      Object.defineProperty(
        context.switchToHttp().getRequest(),
        CASHIER_DEMO_EXECUTION_CONTEXT,
        { value: true },
      );
      return true;
    }

    return super.canActivate(context);
  }
}
