import { SetMetadata } from '@nestjs/common';

export const CASHIER_DEMO_READONLY_KEY = 'cashier_demo_readonly';
export const CASHIER_DEMO_MUTATION_KEY = 'cashier_demo_mutation';
export const CASHIER_DEMO_EXECUTION_CONTEXT = Symbol(
  'cashier_demo_execution_context',
);

export const CashierDemoReadonly = () =>
  SetMetadata(CASHIER_DEMO_READONLY_KEY, true);
export const CashierDemoMutation = () =>
  SetMetadata(CASHIER_DEMO_MUTATION_KEY, true);
