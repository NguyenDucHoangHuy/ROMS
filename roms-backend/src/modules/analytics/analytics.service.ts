import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverviewStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. Doanh thu hôm nay vs hôm qua
    const [todayBills, yesterdayBills] = await Promise.all([
      this.prisma.bill.aggregate({
        where: {
          status: 'PAID',
          createdAt: { gte: today },
        },
        _sum: { finalAmount: true },
      }),
      this.prisma.bill.aggregate({
        where: {
          status: 'PAID',
          createdAt: { gte: yesterday, lt: today },
        },
        _sum: { finalAmount: true },
      }),
    ]);

    const todayRevenue = Number(todayBills._sum.finalAmount || 0);
    const yesterdayRevenue = Number(yesterdayBills._sum.finalAmount || 0);
    const revenueGrowth =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : 0;

    // 2. Khách trong ngày (tổng customerCount của các DiningSession trong hôm nay)
    const sessionsToday = await this.prisma.diningSession.aggregate({
      where: {
        startTime: { gte: today },
      },
      _sum: { customerCount: true },
    });
    const guestsToday = sessionsToday._sum.customerCount || 0;

    // 3. Đơn đang chờ
    const pendingOrdersCount = await this.prisma.order.count({
      where: {
        status: { in: ['CREATED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    // 4. Sức khỏe kho (Mặt hàng sắp hết)
    // Fetch all since inventory is small, or use raw SQL. We use raw SQL for efficiency.
    const lowStockResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM inventory_items 
      WHERE current_stock <= min_alert_threshold
    `;
    const lowStockItemsCount = Number(lowStockResult[0]?.count || 0);

    // 5. Biểu đồ doanh thu 7 ngày qua
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const bills7Days = await this.prisma.bill.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        finalAmount: true,
        createdAt: true,
      },
    });

    // Group theo ngày
    const revenueByDay = Array(7).fill(0);
    const labels = Array(7).fill('');

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      labels[i] = d.toLocaleDateString('vi-VN', { weekday: 'short' });

      const dayBills = bills7Days.filter(
        (b) =>
          b.createdAt.getDate() === d.getDate() &&
          b.createdAt.getMonth() === d.getMonth(),
      );
      revenueByDay[i] = dayBills.reduce(
        (sum, b) => sum + Number(b.finalAmount),
        0,
      );
    }

    // 6. Đơn đang xử lý (LIVE)
    const liveOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['CREATED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        session: {
          include: { table: true },
        },
      },
    });

    return {
      kpi: {
        revenue: {
          value: todayRevenue,
          growth: revenueGrowth,
        },
        guests: {
          value: guestsToday,
          capacity: 85, // Mock capacity for now
        },
        pendingOrders: {
          value: pendingOrdersCount,
          avgTime: '12m',
        },
        inventory: {
          lowStock: lowStockItemsCount,
        },
      },
      chart: {
        labels,
        data: revenueByDay,
      },
      liveOrders: liveOrders.map((o: any) => ({
        id: o.id,
        code: o.orderCode,
        table: o.session.table.tableNumber,
        time: o.createdAt.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        items: o.orderItems.map((oi) => `${oi.quantity}x ${oi.menuItem.name}`),
        status: o.status,
      })),
    };
  }
}
