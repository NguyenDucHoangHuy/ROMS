export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const bypass = config.CASHIER_DEMO_AUTH_BYPASS;

  if (bypass !== undefined && bypass !== 'true' && bypass !== 'false') {
    throw new Error('CASHIER_DEMO_AUTH_BYPASS must be "true" or "false"');
  }

  if (bypass === 'true' && config.NODE_ENV !== 'development') {
    throw new Error(
      'CASHIER_DEMO_AUTH_BYPASS can only be enabled when NODE_ENV=development',
    );
  }

  return config;
}
