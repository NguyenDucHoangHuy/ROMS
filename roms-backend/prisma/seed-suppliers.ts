import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu Nhà cung cấp & cập nhật danh mục kho...');

  // 1. Tạo danh sách Nhà cung cấp mẫu chuẩn
  const suppliersData = [
    {
      name: 'Green Meadow Farms',
      category: 'Rau củ quả tươi',
      contactPerson: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'contact@greenmeadow.com',
      address: '123 Đường Nông Trại, Đà Lạt, Lâm Đồng',
      status: 'ACTIVE',
      rating: 4.9,
      inFlightOrders: 3,
    },
    {
      name: 'Ocean Prime Seafood',
      category: 'Hải sản tươi',
      contactPerson: 'Trần Thị B',
      phone: '0919876543',
      email: 'sales@oceanprime.vn',
      address: 'Cảng Cá Cam Ranh, Khánh Hòa',
      status: 'ACTIVE',
      rating: 4.8,
      inFlightOrders: 0,
    },
    {
      name: 'Sunrise Poultry & Eggs',
      category: 'Gia cầm & Trứng',
      contactPerson: 'Lê Hoàng C',
      phone: '0985551212',
      email: 'order@sunrisepoultry.com',
      address: 'Trang Trại Củ Chi, TP. Hồ Chí Minh',
      status: 'ACTIVE',
      rating: 4.7,
      inFlightOrders: 1,
    },
    {
      name: 'Hokkaido & Wagyu Meats',
      category: 'Thịt bò & Heo',
      contactPerson: 'Yamamoto Kenji',
      phone: '0932223333',
      email: 'info@hokkaidobeef.vn',
      address: 'Khu Công Nghiệp Tân Thuận, Quận 7, TP.HCM',
      status: 'ACTIVE',
      rating: 5.0,
      inFlightOrders: 2,
    },
    {
      name: 'Elite Packaging & Disposables',
      category: 'Vật tư tiêu hao',
      contactPerson: 'Phạm Thị D',
      phone: '0978889999',
      email: 'cskh@elitepack.vn',
      address: 'KCN VSIP 1, Thuận An, Bình Dương',
      status: 'ACTIVE',
      rating: 4.6,
      inFlightOrders: 0,
    },
    {
      name: 'Dalat Fresh Herbs & Spices',
      category: 'Gia vị & Thảo mộc',
      contactPerson: 'Đặng Văn E',
      phone: '0903334444',
      email: 'herbs@dalatspices.com',
      address: 'Vạn Thành, Phường 5, TP. Đà Lạt',
      status: 'ACTIVE',
      rating: 4.9,
      inFlightOrders: 1,
    },
    {
      name: 'Anchor Dairy & Cheese',
      category: 'Bơ sữa & Phô mai',
      contactPerson: 'Vũ Mai F',
      phone: '0912221111',
      email: 'contact@anchordairy.vn',
      address: 'Đường Cộng Hòa, Phường 13, Tân Bình, TP.HCM',
      status: 'ACTIVE',
      rating: 4.9,
      inFlightOrders: 2,
    },
    {
      name: 'Phu Quoc Pepper & Seasoning',
      category: 'Đồ khô & Gia vị truyền thống',
      contactPerson: 'Bùi Quốc G',
      phone: '0945556677',
      email: 'phuquocpepper@gmail.com',
      address: 'Khu Phố 1, Dương Đông, Phú Quốc, Kiên Giang',
      status: 'ACTIVE',
      rating: 4.8,
      inFlightOrders: 0,
    },
  ];

  const db = prisma as any;

  for (const s of suppliersData) {
    const existing = await db.supplier.findFirst({ where: { name: s.name } });
    if (!existing) {
      await db.supplier.create({ data: s });
      console.log(`+ Đã tạo nhà cung cấp: ${s.name}`);
    } else {
      await db.supplier.update({
        where: { id: existing.id },
        data: s,
      });
      console.log(`~ Đã cập nhật nhà cung cấp: ${s.name}`);
    }
  }

  // 2. Cập nhật category và SKU cho toàn bộ InventoryItem hiện có
  const items = await db.inventoryItem.findMany();
  for (const item of items) {
    let cat = 'Khác';
    let prefix = 'OTH';
    const name = item.itemName.toLowerCase();

    if (name.includes('bò') || name.includes('heo') || name.includes('thịt')) {
      cat = 'Thịt các loại';
      prefix = 'MEAT';
    } else if (name.includes('tôm') || name.includes('cá') || name.includes('hải sản') || name.includes('mực')) {
      cat = 'Hải sản tươi';
      prefix = 'SEA';
    } else if (name.includes('gà') || name.includes('trứng') || name.includes('vịt')) {
      cat = 'Gia cầm & Trứng';
      prefix = 'PLT';
    } else if (name.includes('rau') || name.includes('nấm') || name.includes('cà chua') || name.includes('khoai')) {
      cat = 'Rau củ & Nấm';
      prefix = 'VEG';
    } else if (name.includes('phô mai') || name.includes('bơ') || name.includes('sữa')) {
      cat = 'Bơ sữa & Phô mai';
      prefix = 'DAI';
    } else if (name.includes('bột') || name.includes('bánh') || name.includes('mì')) {
      cat = 'Đồ khô & Bột';
      prefix = 'DRY';
    } else if (name.includes('gia vị') || name.includes('nước') || name.includes('sốt')) {
      cat = 'Gia vị & Sốt';
      prefix = 'SPC';
    }

    const sku = `ING-${prefix}-${item.id.slice(0, 4).toUpperCase()}`;

    await db.inventoryItem.update({
      where: { id: item.id },
      data: {
        category: cat,
        sku: sku,
      },
    });
  }

  console.log(`✅ Đã cập nhật danh mục và SKU cho ${items.length} nguyên liệu trong kho!`);
  console.log('🎉 Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error('Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
