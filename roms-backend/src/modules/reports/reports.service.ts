import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BillStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export type RevenuePeriod = 'day' | 'week' | 'month' | 'custom';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueSummary(input: {
    period?: string;
    from?: string;
    to?: string;
  }) {
    const period = (input.period ?? 'month').toLowerCase();
    if (!['day', 'week', 'month', 'custom'].includes(period)) {
      throw new BadRequestException('Unsupported revenue period');
    }
    const range = this.resolveRange(period, input.from, input.to);

    const [
      paidBills,
      refundRows,
      paymentMethodRows,
      totalOrders,
      totalPaidBills,
    ] = await Promise.all([
      this.prisma.bill.findMany({
        where: {
          status: BillStatus.PAID,
          createdAt: {
            gte: range.start,
            lte: range.end,
          },
        },
        select: {
          id: true,
          billCode: true,
          subtotalAmount: true,
          discountAmount: true,
          finalAmount: true,
          createdAt: true,
          payments: {
            where: {
              status: PaymentStatus.SUCCESS,
            },
            select: {
              id: true,
              paymentMethod: true,
              amountPaid: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.findMany({
        where: {
          createdAt: {
            gte: range.start,
            lte: range.end,
          },
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          payment: {
            select: {
              paymentMethod: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: {
          status: PaymentStatus.SUCCESS,
          createdAt: {
            gte: range.start,
            lte: range.end,
          },
        },
        _sum: {
          amountPaid: true,
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: range.start,
            lte: range.end,
          },
          status: {
            not: OrderStatus.CANCELLED,
          },
        },
      }),
      this.prisma.bill.count({
        where: {
          status: BillStatus.PAID,
          createdAt: {
            gte: range.start,
            lte: range.end,
          },
        },
      }),
    ]);

    const grossRevenue = paidBills.reduce(
      (sum, bill) => sum + this.toNumber(bill.finalAmount),
      0,
    );
    const discountAmount = paidBills.reduce(
      (sum, bill) => sum + this.toNumber(bill.discountAmount),
      0,
    );
    const refundAmount = refundRows.reduce(
      (sum, refund) => sum + this.toNumber(refund.amount),
      0,
    );
    const netRevenue = grossRevenue - refundAmount;
    const paymentMethods = this.buildPaymentMethodBreakdown(paymentMethodRows);
    const dailyRevenue = this.buildDailySeries(
      paidBills,
      range.start,
      range.end,
    );
    const recentTransactions = this.buildRecentTransactions(
      paidBills,
      refundRows,
    );

    return {
      period,
      from: range.start.toISOString(),
      to: range.end.toISOString(),
      summary: {
        grossRevenue,
        discountAmount,
        refundAmount,
        netRevenue,
        totalOrders: totalOrders,
        paidOrders: totalPaidBills,
        averageOrderValue:
          totalPaidBills > 0 ? grossRevenue / totalPaidBills : 0,
      },
      paymentMethods,
      dailyRevenue,
      recentTransactions,
    };
  }

  async getAuditLogs(input: {
    page?: number;
    limit?: number;
    action?: string;
    entityName?: string;
    from?: string;
    to?: string;
    search?: string;
  }) {
    const page =
      Number.isFinite(input.page) && Number(input.page) > 0
        ? Number(input.page)
        : 1;
    const limit =
      Number.isFinite(input.limit) && Number(input.limit) > 0
        ? Number(input.limit)
        : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (input.action) {
      where.action = {
        contains: input.action,
        mode: 'insensitive',
      };
    }

    if (input.entityName) {
      where.entityName = {
        contains: input.entityName,
        mode: 'insensitive',
      };
    }

    if (input.from || input.to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (input.from) {
        createdAt.gte = new Date(input.from);
      }
      if (input.to) {
        const endOfDay = new Date(input.to);
        endOfDay.setHours(23, 59, 59, 999);
        createdAt.lte = endOfDay;
      }
      where.createdAt = createdAt;
    }

    if (input.search) {
      const search = input.search.trim();
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityName: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entityName: row.entityName,
        entityId: row.entityId,
        createdAt: row.createdAt,
        actor: row.user
          ? {
              id: row.user.id,
              fullName: row.user.fullName,
              email: row.user.email,
              role: row.user.role?.name ?? null,
            }
          : null,
        ipAddress: row.ipAddress,
        oldValues: row.oldValues,
        newValues: row.newValues,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getEndOfDayReport(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date is required');
    }

    const { start, end } = this.getVietnamDateRange(date, date);
    if (this.formatDateKey(start) !== date) {
      throw new BadRequestException('Invalid date supplied');
    }

    const [revenueSummary, orders, inventoryItems, shiftAssignments] =
      await Promise.all([
        this.getRevenueSummary({
          period: 'custom',
          from: start.toISOString(),
          to: end.toISOString(),
        }),
        this.prisma.order.findMany({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
            status: {
              not: OrderStatus.CANCELLED,
            },
          },
          select: {
            createdAt: true,
            orderItems: {
              select: {
                quantity: true,
                unitPrice: true,
                menuItem: {
                  select: {
                    name: true,
                    category: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        }),
        this.prisma.inventoryItem.findMany({
          where: {
            OR: [{ currentStock: { lte: 0 } }, { currentStock: { lte: 5 } }],
          },
          select: {
            itemName: true,
            currentStock: true,
            minAlertThreshold: true,
          },
          orderBy: { itemName: 'asc' },
        }),
        this.prisma.shiftAssignment.findMany({
          where: {
            assignedDate: {
              gte: start,
              lte: end,
            },
          },
          select: {
            user: {
              select: {
                id: true,
                fullName: true,
                role: { select: { name: true } },
              },
            },
            shift: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
        }),
      ]);

    const categoryMap = new Map<
      string,
      { name: string; revenue: number; quantity: number }
    >();
    const itemMap = new Map<
      string,
      { name: string; revenue: number; quantity: number; unit: string }
    >();
    let totalCategoryRevenue = 0;

    for (const order of orders) {
      for (const item of order.orderItems) {
        const quantity = Number(item.quantity ?? 0);
        const unitPrice = this.toNumber(item.unitPrice ?? 0);
        const revenue = quantity * unitPrice;
        const itemName = item.menuItem?.name ?? 'Unknown item';
        const categoryName = item.menuItem?.category?.name ?? 'Uncategorized';

        const currentItem = itemMap.get(itemName) ?? {
          name: itemName,
          revenue: 0,
          quantity: 0,
          unit: 'items',
        };
        currentItem.revenue += revenue;
        currentItem.quantity += quantity;
        itemMap.set(itemName, currentItem);

        const currentCategory = categoryMap.get(categoryName) ?? {
          name: categoryName,
          revenue: 0,
          quantity: 0,
        };
        currentCategory.revenue += revenue;
        currentCategory.quantity += quantity;
        categoryMap.set(categoryName, currentCategory);
        totalCategoryRevenue += revenue;
      }
    }

    const salesByCategory = [...categoryMap.values()]
      .map((category) => ({
        name: category.name,
        percentage:
          totalCategoryRevenue > 0
            ? (category.revenue / totalCategoryRevenue) * 100
            : 0,
        revenue: category.revenue,
        quantity: category.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const topItems = [...itemMap.values()]
      .map((item) => ({
        rank: 0,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        revenue: item.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const inventoryAlertsResult = inventoryItems
      .filter(
        (item) =>
          this.toNumber(item.currentStock) <=
          this.toNumber(item.minAlertThreshold ?? 5),
      )
      .map((item) => {
        const stock = this.toNumber(item.currentStock);
        const status = stock <= 0 ? 'OUT OF STOCK' : 'LOW STOCK (<5)';
        return {
          name: item.itemName,
          status,
          severity: stock <= 0 ? 'danger' : 'warning',
          quantity: stock,
        };
      });

    const shiftSummary = await Promise.all(
      shiftAssignments.map(async (assignment) => {
        const billTotals = await this.prisma.bill.aggregate({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
            cashierId: assignment.user?.id ?? '',
          },
          _sum: {
            finalAmount: true,
          },
        });

        return {
          staffName: assignment.user?.fullName ?? 'Unknown staff',
          role: assignment.user?.role?.name ?? 'Staff',
          shiftTime: assignment.shift
            ? `${assignment.shift.startTime} - ${assignment.shift.endTime}`
            : 'Unassigned',
          totalSales: this.toNumber(billTotals._sum.finalAmount ?? 0),
          status: 'Closed',
        };
      }),
    );

    return {
      date,
      summary: revenueSummary.summary,
      paymentMethods: revenueSummary.paymentMethods,
      salesByCategory,
      topItems,
      inventoryAlerts: inventoryAlertsResult,
      shiftSummary,
      recentTransactions: revenueSummary.recentTransactions,
    };
  }

  private buildPaymentMethodBreakdown(
    rows: Array<{
      paymentMethod: PaymentMethod;
      _sum: { amountPaid: Prisma.Decimal | null };
      _count: { _all: number };
    }>,
  ) {
    const totals = rows.reduce((sum, row) => {
      const amount = this.toNumber(row._sum.amountPaid ?? 0);
      return sum + amount;
    }, 0);

    return rows
      .map((row) => ({
        method: row.paymentMethod,
        amount: this.toNumber(row._sum.amountPaid ?? 0),
        count: row._count._all,
        percentage:
          totals > 0
            ? (this.toNumber(row._sum.amountPaid ?? 0) / totals) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private buildDailySeries(
    paidBills: Array<{
      finalAmount: Prisma.Decimal;
      createdAt: Date;
    }>,
    start: Date,
    end: Date,
  ) {
    const bucketMap = new Map<string, number>();

    for (const bill of paidBills) {
      const key = this.formatDateKey(new Date(bill.createdAt));
      bucketMap.set(
        key,
        (bucketMap.get(key) ?? 0) + this.toNumber(bill.finalAmount),
      );
    }

    const result: Array<{ date: string; revenue: number }> = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = this.formatDateKey(cursor);
      result.push({
        date: key,
        revenue: bucketMap.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  private buildRecentTransactions(
    paidBills: Array<{
      billCode: string;
      finalAmount: Prisma.Decimal;
      createdAt: Date;
      payments: Array<{
        paymentMethod: PaymentMethod;
        amountPaid: Prisma.Decimal;
      }>;
    }>,
    refundRows: Array<{
      id: string;
      amount: Prisma.Decimal;
      createdAt: Date;
      payment: { paymentMethod: PaymentMethod } | null;
    }>,
  ) {
    const paidTransactions = paidBills.flatMap((bill) => {
      const payment = bill.payments[0];
      if (!payment) return [];
      return [
        {
          id: bill.billCode,
          date: this.formatDisplayDate(bill.createdAt),
          time: this.formatDisplayTime(bill.createdAt),
          timestamp: new Date(bill.createdAt).getTime(),
          status: 'Completed' as const,
          payment: payment.paymentMethod,
          amount: this.toNumber(bill.finalAmount),
        },
      ];
    });

    const refundTransactions = refundRows.flatMap((refund) => {
      if (!refund.payment) return [];
      return [
        {
          id: refund.id,
          date: this.formatDisplayDate(refund.createdAt),
          time: this.formatDisplayTime(refund.createdAt),
          timestamp: new Date(refund.createdAt).getTime(),
          status: 'Refunded' as const,
          payment: refund.payment.paymentMethod,
          amount: -this.toNumber(refund.amount),
        },
      ];
    });

    return [...paidTransactions, ...refundTransactions].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }

  private resolveRange(period: string, from?: string, to?: string) {
    const now = new Date();

    if (from || to) {
      if (!from || !to) {
        throw new BadRequestException(
          'Both from and to are required for custom range',
        );
      }
      const { start, end } =
        /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)
          ? this.getVietnamDateRange(from, to)
          : { start: new Date(from), end: new Date(to) };
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date range supplied');
      }
      if (
        (/^\d{4}-\d{2}-\d{2}$/.test(from) &&
          this.formatDateKey(start) !== from) ||
        (/^\d{4}-\d{2}-\d{2}$/.test(to) && this.formatDateKey(end) !== to)
      ) {
        throw new BadRequestException('Invalid date range supplied');
      }
      if (start > end) {
        throw new BadRequestException(
          'The from date must be earlier than or equal to the to date',
        );
      }
      return { start, end };
    }

    if (period === 'custom') {
      throw new BadRequestException(
        'Both from and to are required for custom range',
      );
    }

    const today = this.formatDateKey(now);
    if (period === 'day') return this.getVietnamDateRange(today, today);
    if (period === 'week') {
      return this.getVietnamDateRange(this.addDays(today, -6), today);
    }
    const [year, month] = today.split('-').map(Number);
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = new Date(Date.UTC(year, month, 0))
      .toISOString()
      .slice(0, 10);
    return this.getVietnamDateRange(monthStart, monthEnd);
  }

  private getVietnamDateRange(from: string, to: string) {
    return {
      start: new Date(`${from}T00:00:00.000+07:00`),
      end: new Date(`${to}T23:59:59.999+07:00`),
    };
  }

  private addDays(date: string, amount: number) {
    const day = new Date(`${date}T00:00:00.000Z`);
    day.setUTCDate(day.getUTCDate() + amount);
    return day.toISOString().slice(0, 10);
  }

  private formatDateKey(date: Date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private formatDisplayDate(date: Date) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatDisplayTime(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  private toNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    return Number(value.toString());
  }
}
