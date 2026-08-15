import { PrismaClient, RoleName, TableStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Tạo 6 Roles chuẩn
  const roles = [
    { name: RoleName.ADMIN, description: 'Quản trị viên hệ thống' },
    { name: RoleName.MANAGER, description: 'Quản lý nhà hàng' },
    { name: RoleName.CASHIER, description: 'Thu ngân quầy POS' },
    { name: RoleName.CHEF, description: 'Đầu bếp KDS' },
    { name: RoleName.WAITER, description: 'Nhân viên phục vụ' },
    { name: RoleName.CUSTOMER, description: 'Khách hàng' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles seeded!');

  // 2. Lấy Role ADMIN để gán cho Admin Account
  const adminRole = await prisma.role.findUnique({
    where: { name: RoleName.ADMIN },
  });

  if (adminRole) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await prisma.user.upsert({
      where: { phone: '0905123456' },
      update: {},
      create: {
        phone: '0905123456',
        fullName: 'System Admin',
        email: 'admin@roms.com',
        passwordHash,
        roleId: adminRole.id,
        isActive: true,
      },
    });
    console.log(
      '✅ Default Admin account created! (Phone: 0905123456 | Pass: Admin@123)',
    );
  }

  // 3. Tạo một số Bàn ăn mẫu (Tầng 1)
  const sampleTables = [
    {
      tableNumber: 'Bàn 01',
      floor: 1,
      capacity: 4,
      qrCodeToken: 'QR_TABLE_01_TOKEN',
    },
    {
      tableNumber: 'Bàn 02',
      floor: 1,
      capacity: 4,
      qrCodeToken: 'QR_TABLE_02_TOKEN',
    },
    {
      tableNumber: 'Bàn 03',
      floor: 1,
      capacity: 6,
      qrCodeToken: 'QR_TABLE_03_TOKEN',
    },
  ];

  for (const table of sampleTables) {
    await prisma.table.upsert({
      where: { tableNumber: table.tableNumber },
      update: {},
      create: {
        ...table,
        status: TableStatus.AVAILABLE,
      },
    });
  }
  console.log('✅ Sample tables seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
