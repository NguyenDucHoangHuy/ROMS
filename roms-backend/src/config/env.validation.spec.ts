import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('allows demo bypass to remain disabled by default', () => {
    expect(validateEnvironment({ NODE_ENV: 'development' })).toEqual({
      NODE_ENV: 'development',
    });
  });

  it('allows the bypass only in development', () => {
    const config = {
      NODE_ENV: 'development',
      CASHIER_DEMO_AUTH_BYPASS: 'true',
    };

    expect(validateEnvironment(config)).toEqual(config);
  });

  it.each(['production', 'test', undefined])(
    'rejects bypass outside development (NODE_ENV=%s)',
    (nodeEnv) => {
      expect(() =>
        validateEnvironment({
          NODE_ENV: nodeEnv,
          CASHIER_DEMO_AUTH_BYPASS: 'true',
        }),
      ).toThrow('CASHIER_DEMO_AUTH_BYPASS can only be enabled');
    },
  );

  it('rejects invalid flag values', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'development',
        CASHIER_DEMO_AUTH_BYPASS: 'yes',
      }),
    ).toThrow('CASHIER_DEMO_AUTH_BYPASS must be "true" or "false"');
  });
});
