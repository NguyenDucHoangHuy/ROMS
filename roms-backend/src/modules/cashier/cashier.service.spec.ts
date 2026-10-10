import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  BillStatus,
  OrderStatus,
  PaymentStatus,
  RoleName,
} from '@prisma/client';
import { CashierService } from './cashier.service';

describe('CashierService', () => {
  it('accepts only an active configured cashier or manager account for demo writes', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cashier-1',
          isActive: true,
          role: { name: RoleName.CASHIER },
        }),
      },
    } as any;
    const service = new CashierService(prisma);

    await expect(
      service.validateDemoCashierIdentity('cashier-1'),
    ).resolves.toBe('cashier-1');
    await expect(service.validateDemoCashierIdentity()).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('excludes cancelled orders from table checkout summaries', async () => {
    const prisma = {
      table: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as any;
    const service = new CashierService(prisma);

    await service.getTables();

    expect(prisma.table.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          diningSessions: expect.objectContaining({
            include: expect.objectContaining({
              orders: expect.objectContaining({
                where: { status: { not: OrderStatus.CANCELLED } },
              }),
            }),
          }),
        }),
      }),
    );
  });

  it('rejects refund when the acting manager lacks the refund approval permission', async () => {
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'payment-1',
          billId: 'bill-1',
          cashierId: 'cashier-1',
          paymentMethod: 'CASH',
          amountPaid: { toString: () => '100.00' },
          changeAmount: { toString: () => '0.00' },
          status: PaymentStatus.SUCCESS,
          createdAt: new Date(),
          bill: { session: { tableId: 'table-1' } },
        }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'manager-1',
          isActive: true,
          role: {
            name: RoleName.CASHIER,
            permissions: [{ permission: { code: 'BILL_CREATE' } }],
          },
        }),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          payment: {
            update: jest.fn(),
          },
          refund: {
            create: jest.fn(),
          },
          auditLog: {
            create: jest.fn(),
          },
        }),
      ),
    } as any;

    const service = new CashierService(prisma);

    await expect(
      service.createRefund(
        'payment-1',
        { amount: 50, reason: 'Customer changed mind' },
        'manager-1',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('records partial refunds without marking the payment fully refunded', async () => {
    const rawQuery = jest.fn();
    const updatePayment = jest.fn();
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'manager-1',
          isActive: true,
          role: {
            name: RoleName.MANAGER,
            permissions: [{ permission: { code: 'REFUND_APPROVE' } }],
          },
        }),
      },
      $transaction: jest.fn(async (callback) => {
        const tx = {
          $queryRaw: rawQuery,
          payment: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'payment-1',
              billId: 'bill-1',
              amountPaid: '100.00',
              changeAmount: '0.00',
              status: PaymentStatus.SUCCESS,
              refunds: [],
            }),
            update: updatePayment,
          },
          refund: {
            create: jest.fn().mockResolvedValue({
              id: 'refund-1',
              paymentId: 'payment-1',
              managerId: 'manager-1',
              amount: { toString: () => '50.00' },
              reason: 'Customer changed mind',
              createdAt: new Date(),
            }),
          },
          auditLog: {
            create: jest.fn(),
          },
        };

        return callback(tx);
      }),
    } as any;

    const service = new CashierService(prisma);

    await expect(
      service.createRefund(
        'payment-1',
        { amount: 50, reason: 'Customer changed mind' },
        'manager-1',
      ),
    ).resolves.toMatchObject({
      refund: expect.objectContaining({
        id: 'refund-1',
        amount: 50,
      }),
      payment: expect.objectContaining({
        status: 'PARTIALLY_REFUNDED',
      }),
    });

    expect(rawQuery).toHaveBeenCalled();
    expect(updatePayment).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      data: { status: PaymentStatus.SUCCESS },
    });
  });

  it('rejects non-cash payments above the persisted bill total', async () => {
    const prisma = {
      bill: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bill-1',
          status: BillStatus.UNPAID,
          finalAmount: 100,
          sessionId: 'session-1',
          session: { tableId: 'table-1' },
          payments: [],
        }),
      },
    } as any;
    const service = new CashierService(prisma);

    await expect(
      service.createPayment(
        { billId: 'bill-1', paymentMethod: 'card', amountPaid: 110 },
        'cashier-1',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).toBeUndefined();
  });

  it('keeps a split-bill session open until its last unpaid bill is paid', async () => {
    const sessionUpdate = jest.fn();
    const tableUpdate = jest.fn();
    const prisma = {
      bill: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bill-1',
          billCode: 'BILL-1',
          status: BillStatus.UNPAID,
          finalAmount: 100,
          sessionId: 'session-1',
          session: { tableId: 'table-1' },
          payments: [],
        }),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          bill: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            count: jest.fn().mockResolvedValue(1),
          },
          payment: {
            create: jest.fn().mockResolvedValue({
              id: 'payment-1',
              billId: 'bill-1',
              cashierId: 'cashier-1',
              paymentMethod: 'CASH',
              amountPaid: 100,
              changeAmount: 0,
              transactionCode: 'TXN-1',
              status: PaymentStatus.SUCCESS,
              createdAt: new Date(),
            }),
          },
          diningSession: { update: sessionUpdate },
          table: { update: tableUpdate },
          auditLog: { create: jest.fn() },
        }),
      ),
    } as any;
    const service = new CashierService(prisma);

    await expect(
      service.createPayment(
        { billId: 'bill-1', paymentMethod: 'cash', amountPaid: 100 },
        'cashier-1',
      ),
    ).resolves.toMatchObject({
      session: { status: 'PAYING' },
      table: { status: 'occupied' },
    });
    expect(sessionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'PAYING' },
      }),
    );
    expect(tableUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'OCCUPIED' },
      }),
    );
  });

  it('rejects refunds above the remaining retained balance after cash change', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'manager-1',
          isActive: true,
          role: {
            name: RoleName.MANAGER,
            permissions: [{ permission: { code: 'REFUND_APPROVE' } }],
          },
        }),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          $queryRaw: jest.fn(),
          payment: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'payment-1',
              billId: 'bill-1',
              amountPaid: '120.00',
              changeAmount: '20.00',
              status: PaymentStatus.SUCCESS,
              refunds: [{ amount: '60.00' }],
            }),
            update: jest.fn(),
          },
          refund: { create: jest.fn() },
          auditLog: { create: jest.fn() },
        }),
      ),
    } as any;

    const service = new CashierService(prisma);

    await expect(
      service.createRefund(
        'payment-1',
        { amount: 101, reason: 'Invalid refund amount' },
        'manager-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('splits a single order item across multiple bills when allocations total the original quantity', async () => {
    const prisma = {
      bill: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bill-1',
          status: BillStatus.UNPAID,
          sessionId: 'session-1',
          subtotalAmount: { toString: () => '400.00' },
          discountAmount: { toString: () => '0.00' },
          finalAmount: { toString: () => '400.00' },
          payments: [],
        }),
        create: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'split-bill-1',
            billCode: 'BILL-1',
            finalAmount: { toString: () => '100.00' },
          })
          .mockResolvedValueOnce({
            id: 'split-bill-2',
            billCode: 'BILL-2',
            finalAmount: { toString: () => '300.00' },
          }),
        update: jest.fn(),
      },
      order: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'order-1',
            orderItems: [
              {
                id: 'item-1',
                quantity: 4,
                unitPrice: { toString: () => '100.00' },
              },
            ],
          },
        ]),
      },
      user: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 'cashier-1', isActive: true }),
      },
      $transaction: jest.fn(async (callback) => {
        const tx = {
          bill: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            create: prisma.bill.create,
            update: prisma.bill.update,
          },
          order: {
            findMany: prisma.order.findMany,
          },
          auditLog: {
            create: jest.fn(),
          },
        };

        return callback(tx);
      }),
    } as any;

    const service = new CashierService(prisma);

    await expect(
      service.splitBill(
        'bill-1',
        {
          groups: [
            { items: [{ orderItemId: 'item-1', quantity: 1 }] },
            { items: [{ orderItemId: 'item-1', quantity: 3 }] },
          ],
        },
        'cashier-1',
      ),
    ).resolves.toMatchObject({
      totalSplitAmount: 400,
      createdBills: expect.arrayContaining([
        expect.objectContaining({ id: 'split-bill-1' }),
        expect.objectContaining({ id: 'split-bill-2' }),
      ]),
    });
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: {
        sessionId: 'session-1',
        status: { not: OrderStatus.CANCELLED },
      },
      include: { orderItems: true },
    });
  });

  it('rejects split allocations that exceed the original item quantity', async () => {
    const prisma = {
      bill: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bill-1',
          status: BillStatus.UNPAID,
          sessionId: 'session-1',
          subtotalAmount: { toString: () => '400.00' },
          discountAmount: { toString: () => '0.00' },
          finalAmount: { toString: () => '400.00' },
          payments: [],
        }),
      },
      order: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'order-1',
            orderItems: [
              {
                id: 'item-1',
                quantity: 4,
                unitPrice: { toString: () => '100.00' },
              },
            ],
          },
        ]),
      },
      user: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 'cashier-1', isActive: true }),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          bill: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            create: jest.fn(),
            update: jest.fn(),
          },
          order: {
            findMany: prisma.order.findMany,
          },
          auditLog: {
            create: jest.fn(),
          },
        }),
      ),
    } as any;

    const service = new CashierService(prisma);

    await expect(
      service.splitBill(
        'bill-1',
        {
          groups: [
            { items: [{ orderItemId: 'item-1', quantity: 3 }] },
            { items: [{ orderItemId: 'item-1', quantity: 3 }] },
          ],
        },
        'cashier-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns the current shift for a cashier with a valid assignment for today', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cashier-1',
          fullName: 'Cashier A',
          role: { name: RoleName.CASHIER },
          isActive: true,
        }),
      },
      shiftAssignment: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'assignment-1',
          userId: 'cashier-1',
          assignedDate: new Date('2025-01-15T00:00:00Z'),
          shift: {
            id: 'shift-1',
            name: 'Morning Shift',
            startTime: '08:00',
            endTime: '16:00',
          },
          attendances: [
            {
              id: 'attendance-1',
              checkInTime: new Date('2025-01-15T08:15:00Z'),
              checkOutTime: null,
              status: 'ON_TIME',
            },
          ],
        }),
      },
      attendance: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'attendance-1',
          checkInTime: new Date('2025-01-15T08:15:00Z'),
          checkOutTime: null,
          status: 'ON_TIME',
        }),
      },
      bill: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { finalAmount: { toString: () => '250.00' } },
        }),
      },
    } as any;

    const service = new CashierService(prisma);

    await expect(
      service.getCurrentShiftForUser('cashier-1'),
    ).resolves.toMatchObject({
      hasShift: true,
      status: 'OPEN',
      shiftName: 'Morning Shift',
      totalSales: 250,
    });
  });

  it('starts a shift by creating or updating attendance for the active assignment', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cashier-1',
          fullName: 'Cashier A',
          role: { name: RoleName.CASHIER },
          isActive: true,
        }),
      },
      shiftAssignment: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'assignment-1',
          assignedDate: new Date('2025-01-15T00:00:00Z'),
          shift: {
            id: 'shift-1',
            name: 'Morning Shift',
            startTime: '08:00',
            endTime: '16:00',
          },
        }),
      },
      attendance: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'attendance-1',
          checkInTime: new Date('2025-01-15T08:00:00Z'),
          status: 'ON_TIME',
        }),
      },
      bill: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { finalAmount: { toString: () => '0.00' } },
        }),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          shiftAssignment: {
            findFirst: jest.fn().mockResolvedValue({
              id: 'assignment-1',
              shift: { id: 'shift-1', name: 'Morning Shift' },
            }),
          },
          attendance: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({
              id: 'attendance-1',
              checkInTime: new Date('2025-01-15T08:00:00Z'),
              status: 'ON_TIME',
            }),
          },
          bill: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { finalAmount: { toString: () => '0.00' } },
            }),
          },
          auditLog: {
            create: jest.fn(),
          },
        }),
      ),
    } as any;

    const service = new CashierService(prisma);

    await expect(service.startShift('cashier-1')).resolves.toMatchObject({
      started: true,
      shiftName: 'Morning Shift',
    });
  });
});
