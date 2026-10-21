import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BillStatus, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async generateBill(sessionId: string, cashierId: string) {
    const session = await this.prisma.diningSession.findUnique({
      where: { id: sessionId },
      include: { orders: true, bills: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    // Nếu đã có Bill chưa thanh toán, trả về Bill đó
    const existingBill = session.bills.find(
      (b) =>
        b.status === BillStatus.UNPAID ||
        b.status === BillStatus.PARTIALLY_PAID,
    );
    if (existingBill) return existingBill;

    // Tính tổng tiền các Order không bị CANCELLED
    const validOrders = session.orders.filter(
      (o) => o.status !== OrderStatus.CANCELLED,
    );
    let subtotalAmount = new Prisma.Decimal(0);
    validOrders.forEach((o) => {
      subtotalAmount = subtotalAmount.add(o.totalAmount);
    });

    const finalAmount = subtotalAmount; // Chưa có logic discount promotion

    return this.prisma.bill.create({
      data: {
        billCode: `BILL-${Date.now()}`,
        sessionId,
        cashierId,
        subtotalAmount,
        discountAmount: 0,
        finalAmount,
        status: BillStatus.UNPAID,
      },
    });
  }

  async processPayment(
    sessionId: string,
    cashierId: string,
    dto: CreatePaymentDto,
  ) {
    const bill = await this.prisma.bill.findFirst({
      where: {
        sessionId,
        status: { in: [BillStatus.UNPAID, BillStatus.PARTIALLY_PAID] },
      },
    });
    if (!bill)
      throw new BadRequestException('No unpaid bill found for this session');

    return this.prisma.$transaction(async (tx) => {
      const amountPaid = new Prisma.Decimal(dto.amountPaid);
      let changeAmount = new Prisma.Decimal(0);
      let newStatus = bill.status;

      // Giả sử chỉ thanh toán 1 lần đủ tiền (chưa làm phần trả góp/tách bill phức tạp)
      if (amountPaid.gte(bill.finalAmount)) {
        changeAmount = amountPaid.sub(bill.finalAmount);
        newStatus = BillStatus.PAID;
      } else {
        newStatus = BillStatus.PARTIALLY_PAID; // Hoặc báo lỗi không đủ tiền
      }

      const payment = await tx.payment.create({
        data: {
          billId: bill.id,
          cashierId,
          paymentMethod: dto.paymentMethod,
          amountPaid,
          changeAmount,
          transactionCode: dto.transactionCode,
          status: PaymentStatus.SUCCESS,
        },
      });

      await tx.bill.update({
        where: { id: bill.id },
        data: { status: newStatus },
      });

      return payment;
    });
  }

  async getHistory() {
    return this.prisma.bill.findMany({
      where: { status: BillStatus.PAID },
      include: {
        payments: true,
        session: { include: { table: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
