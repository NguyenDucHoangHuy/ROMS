import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { CashierController } from './cashier.controller';
import { CashierDevReadonlyAuthGuard } from './cashier-dev-readonly.guard';
import {
  CASHIER_DEMO_EXECUTION_CONTEXT,
  CASHIER_DEMO_MUTATION_KEY,
  CASHIER_DEMO_READONLY_KEY,
} from '../auth/cashier-demo-readonly.decorator';

describe('CashierDevReadonlyAuthGuard', () => {
  const authGuardPrototype = Object.getPrototypeOf(
    CashierDevReadonlyAuthGuard.prototype,
  );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createContext(method: string): ExecutionContext {
    const request = { method };
    return {
      getHandler: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  function createGuard(
    config: Record<string, string>,
    markedReadonly: boolean,
    markedMutation = false,
  ): CashierDevReadonlyAuthGuard {
    const configService = {
      get: (key: string) => config[key],
    } as unknown as ConfigService;
    const reflector = {
      getAllAndOverride: (key: string) =>
        key === CASHIER_DEMO_READONLY_KEY ? markedReadonly : markedMutation,
    } as unknown as Reflector;

    return new CashierDevReadonlyAuthGuard(configService, reflector);
  }

  it('allows marked GET requests without a user only in enabled local development', () => {
    const guard = createGuard(
      {
        CASHIER_DEMO_AUTH_BYPASS: 'true',
        NODE_ENV: 'development',
      },
      true,
    );

    expect(guard.canActivate(createContext('GET'))).toBe(true);
  });

  it('allows marked local demo mutations and sets a server-only execution context', () => {
    const context = createContext('POST');
    const guard = createGuard(
      {
        CASHIER_DEMO_AUTH_BYPASS: 'true',
        NODE_ENV: 'development',
      },
      false,
      true,
    );

    expect(guard.canActivate(context)).toBe(true);
    expect(
      context.switchToHttp().getRequest()[CASHIER_DEMO_EXECUTION_CONTEXT],
    ).toBe(true);
  });

  it.each([
    ['disabled flag', { NODE_ENV: 'development' }, true, 'GET'],
    [
      'non-development environment',
      { CASHIER_DEMO_AUTH_BYPASS: 'true', NODE_ENV: 'production' },
      true,
      'GET',
    ],
    [
      'unmarked route',
      { CASHIER_DEMO_AUTH_BYPASS: 'true', NODE_ENV: 'development' },
      false,
      'GET',
    ],
    [
      'non-GET method',
      { CASHIER_DEMO_AUTH_BYPASS: 'true', NODE_ENV: 'development' },
      true,
      'POST',
    ],
    [
      'unmarked mutation',
      { CASHIER_DEMO_AUTH_BYPASS: 'true', NODE_ENV: 'development' },
      false,
      'POST',
    ],
  ])(
    'delegates to JWT authentication for %s',
    (_case, config, marked, method) => {
      const jwtCanActivate = jest
        .spyOn(authGuardPrototype, 'canActivate')
        .mockReturnValue(true);
      const guard = createGuard(
        config as Record<string, string>,
        marked as boolean,
      );

      expect(guard.canActivate(createContext(method as string))).toBe(true);
      expect(jwtCanActivate).toHaveBeenCalledTimes(1);
    },
  );

  it('marks only explicitly allowed read-only controller methods', () => {
    const allowedMethods = [
      'getTables',
      'getMenu',
      'getTableOrder',
      'getTransactions',
      'getRevenue',
      'getAuditLogs',
      'getEndOfDayReport',
      'getCurrentShift',
    ];
    const allowedMutations = [
      'mergeTables',
      'markTableClean',
      'createOrder',
      'validatePromotion',
      'createBill',
      'createPayment',
      'createRefund',
      'splitBill',
    ];
    const protectedMethods = [
      'mergeTables',
      'markTableClean',
      'validatePromotion',
      'createBill',
      'createPayment',
      'createRefund',
      'splitBill',
      'addOrderItem',
      'updateOrderItem',
      'removeOrderItem',
      'startShift',
      'closeShift',
    ];

    for (const method of allowedMethods) {
      expect(
        Reflect.getMetadata(
          CASHIER_DEMO_READONLY_KEY,
          CashierController.prototype[method],
        ),
      ).toBe(true);
    }

    for (const method of protectedMethods) {
      expect(
        Reflect.getMetadata(
          CASHIER_DEMO_READONLY_KEY,
          CashierController.prototype[method],
        ),
      ).toBeUndefined();
    }

    for (const method of allowedMutations) {
      expect(
        Reflect.getMetadata(
          CASHIER_DEMO_MUTATION_KEY,
          CashierController.prototype[method],
        ),
      ).toBe(true);
    }

    for (const method of [
      'addOrderItem',
      'updateOrderItem',
      'removeOrderItem',
    ]) {
      expect(
        Reflect.getMetadata(
          CASHIER_DEMO_MUTATION_KEY,
          CashierController.prototype[method],
        ),
      ).toBeUndefined();
    }
  });
});
