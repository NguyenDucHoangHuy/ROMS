import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  it('builds an end-of-day report from the selected date', async () => {
    const prisma: any = {
      bill: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'bill-1',
            billCode: 'BILL-001',
            subtotalAmount: '1200000',
            discountAmount: '50000',
            finalAmount: '1150000',
            createdAt: new Date('2025-01-15T12:00:00Z'),
            payments: [{ paymentMethod: 'CASH', amountPaid: '1150000' }],
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
        aggregate: jest
          .fn()
          .mockResolvedValue({ _sum: { finalAmount: '1150000' } }),
      },
      refund: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'refund-1',
            amount: '50000',
            createdAt: new Date('2025-01-15T14:30:00Z'),
            payment: { paymentMethod: 'CASH' },
          },
        ]),
      },
      payment: {
        groupBy: jest.fn().mockResolvedValue([
          {
            paymentMethod: 'CASH',
            _sum: { amountPaid: '1150000' },
            _count: { _all: 1 },
          },
        ]),
      },
      order: {
        findMany: jest.fn().mockResolvedValue([
          {
            createdAt: new Date('2025-01-15T12:00:00Z'),
            status: 'COMPLETED',
            orderItems: [
              {
                quantity: 2,
                unitPrice: '90000',
                menuItem: {
                  name: 'Pho Bo',
                  category: { name: 'Food' },
                },
              },
              {
                quantity: 1,
                unitPrice: '60000',
                menuItem: {
                  name: 'Tra Dao',
                  category: { name: 'Beverages' },
                },
              },
            ],
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
      inventoryItem: {
        findMany: jest.fn().mockResolvedValue([
          {
            itemName: 'Fresh Milk',
            currentStock: '4',
            minAlertThreshold: '5',
          },
        ]),
      },
      shiftAssignment: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const service = new ReportsService(prisma as any);
    const result = await service.getEndOfDayReport('2025-01-15');

    expect(result.summary.grossRevenue).toBe(1150000);
    expect(result.summary.refundAmount).toBe(50000);
    expect(result.summary.netRevenue).toBe(1100000);
    expect(result.salesByCategory[0].name).toBe('Food');
    expect(result.topItems[0].name).toBe('Pho Bo');
    expect(result.inventoryAlerts[0].name).toBe('Fresh Milk');
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          createdAt: {
            gte: new Date('2025-01-14T17:00:00.000Z'),
            lte: new Date('2025-01-15T16:59:59.999Z'),
          },
          status: { not: 'CANCELLED' },
        },
      }),
    );
  });
});
