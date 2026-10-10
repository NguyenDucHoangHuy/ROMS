import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/roles.guard';
import { CASHIER_DEMO_EXECUTION_CONTEXT } from '../auth/cashier-demo-readonly.decorator';

@Injectable()
export class CashierDemoRolesGuard extends RolesGuard {
  constructor(
    reflector: Reflector,
    private readonly demoConfig: ConfigService,
  ) {
    super(reflector, demoConfig);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Record<PropertyKey, unknown>>();
    const isDemoExecution = request[CASHIER_DEMO_EXECUTION_CONTEXT] === true;
    const isDemoEnabled =
      this.demoConfig.get<string>('CASHIER_DEMO_AUTH_BYPASS') === 'true' &&
      this.demoConfig.get<string>('NODE_ENV') === 'development';

    if (isDemoExecution && isDemoEnabled) return true;
    return super.canActivate(context);
  }
}
