import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsController } from './reports.controller';

describe('ReportsController authentication', () => {
  it('requires JWT authentication for reports routes', () => {
    expect(Reflect.getMetadata('__guards__', ReportsController)).toContain(
      JwtAuthGuard,
    );
  });
});
