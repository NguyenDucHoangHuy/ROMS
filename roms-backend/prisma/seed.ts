import {
  PrismaClient,
  RoleName,
  TableStatus,
  OrderStatus,
  OrderItemStatus,
  SessionStatus,
  StockMovementType,
  AttendanceStatus,
  ReservationStatus,
  DepositStatus,
  BillStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu dọn dẹp và nạp đầy đủ dữ liệu (Full Recipes BOM)...');

  // ==========================================
  // 0. DỌN SẠCH DỮ LIỆU CŨ ĐỂ TRÁNH XUNG ĐỘT
  // ==========================================
  await prisma.auditLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.shiftAssignment.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.diningSession.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.stockReceiptDetail.deleteMany();
  await prisma.stockReceipt.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  // ==========================================
  // 1. TẠO 6 ROLES HỆ THỐNG
  // ==========================================
  const roles = [
    { name: RoleName.ADMIN, description: 'Quản trị viên hệ thống' },
    { name: RoleName.MANAGER, description: 'Quản lý nhà hàng' },
    { name: RoleName.CASHIER, description: 'Thu ngân quầy POS' },
    { name: RoleName.CHEF, description: 'Đầu bếp KDS' },
    { name: RoleName.WAITER, description: 'Nhân viên phục vụ' },
    { name: RoleName.CUSTOMER, description: 'Khách hàng' },
  ];

  for (const role of roles) {
    await prisma.role.create({ data: role });
  }

  // ==========================================
  // 2. TẠO TÀI KHOẢN NHÂN VIÊN
  // ==========================================
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.ADMIN },
  });
  const chefRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.CHEF },
  });
  const waiterRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.WAITER },
  });
  const cashierRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.CASHIER },
  });

  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      phone: '0905123456',
      fullName: 'System Admin',
      email: 'admin@roms.com',
      passwordHash: defaultPasswordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const chefUser = await prisma.user.create({
    data: {
      phone: '0905111222',
      fullName: 'Chef Marco Pierre',
      email: 'marco@roms.com',
      passwordHash: defaultPasswordHash,
      roleId: chefRole.id,
      isActive: true,
    },
  });

  const waiterMia = await prisma.user.create({
    data: {
      phone: '0905333444',
      fullName: 'Mia Jenkins',
      email: 'mia@roms.com',
      passwordHash: defaultPasswordHash,
      roleId: waiterRole.id,
      isActive: true,
    },
  });

  const cashierElena = await prisma.user.create({
    data: {
      phone: '0905555666',
      fullName: 'Elena Rostova',
      email: 'elena@roms.com',
      passwordHash: defaultPasswordHash,
      roleId: cashierRole.id,
      isActive: true,
    },
  });

  // ==========================================
  // 3. TẠO BÀN ĂN
  // ==========================================
  const tablesData = [
    {
      tableNumber: 'TABLE 12',
      floor: 1,
      capacity: 4,
      qrCodeToken: 'QR_TABLE_12',
    },
    {
      tableNumber: 'TABLE 4',
      floor: 1,
      capacity: 2,
      qrCodeToken: 'QR_TABLE_04',
    },
    {
      tableNumber: 'TABLE 8',
      floor: 2,
      capacity: 6,
      qrCodeToken: 'QR_TABLE_08',
    },
    {
      tableNumber: 'TABLE 22',
      floor: 2,
      capacity: 4,
      qrCodeToken: 'QR_TABLE_22',
    },
    { tableNumber: 'BAR 3', floor: 1, capacity: 2, qrCodeToken: 'QR_BAR_03' },
  ];

  const createdTables = [];
  for (const t of tablesData) {
    const table = await prisma.table.create({
      data: { ...t, status: TableStatus.AVAILABLE },
    });
    createdTables.push(table);
  }

  // ==========================================
  // 4. TẠO DANH MỤC CATEGORIES
  // ==========================================
  const categoriesList = ['Appetizer', 'Main', 'Dessert', 'Drink'];
  const catMap: Record<string, string> = {};

  for (let i = 0; i < categoriesList.length; i++) {
    const cat = await prisma.category.create({
      data: {
        name: categoriesList[i],
        displayOrder: i + 1,
        isActive: true,
      },
    });
    catMap[categoriesList[i]] = cat.id;
  }

  // ==========================================
  // 5. TẠO KHO NGUYÊN LIỆU ĐẦY ĐỦ (24 NGUYÊN LIỆU BẢN GỐC)
  // ==========================================
  const inventoryItemsData = [
    {
      itemName: 'Thịt bò Úc & Wagyu',
      unit: 'kg',
      currentStock: 35.0,
      minAlertThreshold: 5.0,
    },
    {
      itemName: 'Tôm & Hải sản tươi',
      unit: 'kg',
      currentStock: 25.0,
      minAlertThreshold: 5.0,
    },
    {
      itemName: 'Cá hồi Na Uy',
      unit: 'kg',
      currentStock: 18.0,
      minAlertThreshold: 4.0,
    },
    {
      itemName: 'Cá tuyết Cod Fillet',
      unit: 'kg',
      currentStock: 15.0,
      minAlertThreshold: 3.0,
    },
    {
      itemName: 'Thịt gà tươi & Cánh gà',
      unit: 'kg',
      currentStock: 40.0,
      minAlertThreshold: 8.0,
    },
    {
      itemName: 'Sườn heo & Thịt heo',
      unit: 'kg',
      currentStock: 30.0,
      minAlertThreshold: 6.0,
    },
    {
      itemName: 'Sườn cừu tươi',
      unit: 'kg',
      currentStock: 12.0,
      minAlertThreshold: 3.0,
    },
    {
      itemName: 'Ức vịt tươi',
      unit: 'kg',
      currentStock: 10.0,
      minAlertThreshold: 2.0,
    },
    {
      itemName: 'Gạo thơm & Nếp Thái',
      unit: 'kg',
      currentStock: 80.0,
      minAlertThreshold: 15.0,
    },
    {
      itemName: 'Mì Pasta & Bánh phở',
      unit: 'kg',
      currentStock: 60.0,
      minAlertThreshold: 10.0,
    },
    {
      itemName: 'Bột Tempura & Chiên giòn',
      unit: 'kg',
      currentStock: 25.0,
      minAlertThreshold: 5.0,
    },
    {
      itemName: 'Khoai tây củ & Khoai que',
      unit: 'kg',
      currentStock: 50.0,
      minAlertThreshold: 10.0,
    },
    {
      itemName: 'Bánh mì & Vỏ bánh Burger',
      unit: 'cái',
      currentStock: 120.0,
      minAlertThreshold: 20.0,
    },
    {
      itemName: 'Rau xà lách & Salad xanh',
      unit: 'kg',
      currentStock: 30.0,
      minAlertThreshold: 5.0,
    },
    {
      itemName: 'Cà chua & Thảo mộc Basil',
      unit: 'kg',
      currentStock: 25.0,
      minAlertThreshold: 4.0,
    },
    {
      itemName: 'Nấm tươi các loại',
      unit: 'kg',
      currentStock: 20.0,
      minAlertThreshold: 4.0,
    },
    {
      itemName: 'Phô mai Cheddar & Mozzarella',
      unit: 'kg',
      currentStock: 22.0,
      minAlertThreshold: 5.0,
    },
    {
      itemName: 'Bơ Pháp & Dầu Olive tỏi',
      unit: 'kg',
      currentStock: 18.0,
      minAlertThreshold: 3.0,
    },
    {
      itemName: 'Nấm Truffle đen tươi',
      unit: 'gram',
      currentStock: 45.0,
      minAlertThreshold: 100.0,
    },
    {
      itemName: 'Sữa tươi thanh trùng',
      unit: 'liter',
      currentStock: 60.0,
      minAlertThreshold: 10.0,
    },
    {
      itemName: 'Kem béo Whipping & Mascarpone',
      unit: 'liter',
      currentStock: 25.0,
      minAlertThreshold: 5.0,
    },
    {
      itemName: 'Hạt Cà phê Espresso Ý',
      unit: 'kg',
      currentStock: 15.0,
      minAlertThreshold: 3.0,
    },
    {
      itemName: 'Trà đen & Bột Matcha Nhật',
      unit: 'kg',
      currentStock: 12.0,
      minAlertThreshold: 2.0,
    },
    {
      itemName: 'Trái cây tươi & Sốt Puree',
      unit: 'kg',
      currentStock: 35.0,
      minAlertThreshold: 6.0,
    },
  ];

  const inv: Record<string, string> = {};
  for (const item of inventoryItemsData) {
    const created = await prisma.inventoryItem.create({ data: item });
    inv[item.itemName] = created.id;
  }
  console.log('✅ Đã tạo 24 mặt hàng nguyên liệu kho!');

  // ==========================================
  // 6. DANH SÁCH 64 MÓN VỚI CÔNG THỨC RECIPES (BOM) CHI TIẾT
  // ==========================================
  const menuWithRecipes = [
    // --- APPETIZERS (15 MÓN) ---
    {
      name: 'Crispy Shrimp Tempura',
      price: 3.99,
      category: 'Appetizer',
      description:
        'Crispy deep-fried fresh shrimp served with sweet and sour dipping sauce.',
      imageUrl:
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Tôm & Hải sản tươi'], quantityRequired: 0.16 },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.05,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Seafood Spring Rolls',
      price: 3.49,
      category: 'Appetizer',
      description:
        'Deep-fried panko-crusted spring rolls stuffed with rich seafood filling.',
      imageUrl:
        'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Tôm & Hải sản tươi'], quantityRequired: 0.12 },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.04,
        },
        { inventoryItemId: inv['Nấm tươi các loại'], quantityRequired: 0.03 },
      ],
    },
    {
      name: 'Grilled Chicken Caesar Salad',
      price: 4.29,
      category: 'Appetizer',
      description:
        'Crisp Romaine lettuce, grilled chicken breast, traditional Caesar dressing, croutons.',
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Thịt gà tươi & Cánh gà'],
          quantityRequired: 0.15,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.15,
        },
        {
          inventoryItemId: inv['Bánh mì & Vỏ bánh Burger'],
          quantityRequired: 0.5,
        },
      ],
    },
    {
      name: 'BBQ Chicken Wings',
      price: 3.99,
      category: 'Appetizer',
      description:
        'Crispy fried chicken wings coated in rich, mildly spicy BBQ sauce.',
      imageUrl:
        'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Thịt gà tươi & Cánh gà'],
          quantityRequired: 0.3,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.02,
        },
      ],
    },
    {
      name: 'Cheese Fries',
      price: 2.49,
      category: 'Appetizer',
      description:
        'Crispy French fries coated with savory and sweet cheese powder.',
      imageUrl:
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Khoai tây củ & Khoai que'],
          quantityRequired: 0.25,
        },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Smoked Cheddar Bites',
      price: 6.59,
      category: 'Appetizer',
      description:
        'Crispy bite-sized snacks filled with rich smoked cheddar cheese, melted.',
      imageUrl:
        'https://images.unsplash.com/photo-1485963631004-f2f00b1d6604?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.12,
        },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Bruschetta Tomato & Basil',
      price: 3.19,
      category: 'Appetizer',
      description:
        'Toasted baguette slices topped with diced tomatoes, garlic, fresh basil, olive oil.',
      imageUrl:
        'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bánh mì & Vỏ bánh Burger'],
          quantityRequired: 1.0,
        },
        {
          inventoryItemId: inv['Cà chua & Thảo mộc Basil'],
          quantityRequired: 0.12,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.02,
        },
      ],
    },
    {
      name: 'Crispy Calamari Rings',
      price: 4.49,
      category: 'Appetizer',
      description:
        'Golden crispy squid rings served with garlic aioli and lemon wedges.',
      imageUrl:
        'https://images.unsplash.com/photo-1746135220790-b59f24e9309b?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Tôm & Hải sản tươi'], quantityRequired: 0.2 },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'African Sambusa',
      price: 8.65,
      category: 'Appetizer',
      description:
        'Crispy triangular pastries filled with seasoned meat, onions, spices.',
      imageUrl:
        'https://images.unsplash.com/photo-1695297516676-47b2c5c962b1?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Thịt bò Úc & Wagyu'], quantityRequired: 0.14 },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.06,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Stuffed Baked Mushrooms',
      price: 3.89,
      category: 'Appetizer',
      description:
        'Button mushrooms stuffed with garlic herb cream cheese and baked.',
      imageUrl:
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Nấm tươi các loại'], quantityRequired: 0.18 },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.05,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.02,
        },
      ],
    },
    {
      name: 'Bulgogi Steak Tartare',
      price: 16.99,
      category: 'Appetizer',
      description:
        'Korean-style beef tartare with bulgogi flavors and fresh garnishes.',
      imageUrl:
        'https://images.unsplash.com/photo-167664778856-b48ba7d8cf16?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Thịt bò Úc & Wagyu'], quantityRequired: 0.18 },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.05,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.02,
        },
      ],
    },
    {
      name: 'Beef Tataki',
      price: 55.99,
      category: 'Appetizer',
      description:
        'Seared rare tenderloin sliced thinly with ponzu dressing and scallions.',
      imageUrl:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Thịt bò Úc & Wagyu'], quantityRequired: 0.25 },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Garlic Butter Garlic Bread',
      price: 2.29,
      category: 'Appetizer',
      description:
        'Toasted artisan sourdough brushed with garlic herb butter and mozzarella.',
      imageUrl:
        'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bánh mì & Vỏ bánh Burger'],
          quantityRequired: 1.0,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.04,
        },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Pork Gyoza Dumplings',
      price: 3.79,
      category: 'Appetizer',
      description:
        'Pan-fried Japanese pork dumplings served with ginger soy dip.',
      imageUrl:
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Sườn heo & Thịt heo'], quantityRequired: 0.14 },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.05,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Tomato Bruschetta',
      price: 9.99,
      category: 'Appetizer',
      description: 'Toasted bread topped with fresh tomatoes and herbs.',
      imageUrl:
        'https://images.unsplash.com/photo-1761315412730-a6f6720db10a?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bánh mì & Vỏ bánh Burger'],
          quantityRequired: 1.0,
        },
        {
          inventoryItemId: inv['Cà chua & Thảo mộc Basil'],
          quantityRequired: 0.15,
        },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.04,
        },
      ],
    },

    // --- MAINS (16 MÓN) ---
    {
      name: 'Spaghetti Bolognese',
      price: 5.99,
      category: 'Main',
      description:
        'Classic al dente Italian pasta topped with rich minced beef tomato sauce.',
      imageUrl:
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Mì Pasta & Bánh phở'], quantityRequired: 0.12 },
        { inventoryItemId: inv['Thịt bò Úc & Wagyu'], quantityRequired: 0.14 },
        {
          inventoryItemId: inv['Cà chua & Thảo mộc Basil'],
          quantityRequired: 0.1,
        },
      ],
    },
    {
      name: 'Pan-Seared Salmon with Lemon Butter Sauce',
      price: 12.49,
      category: 'Main',
      description:
        'Norwegian salmon fillet pan-seared to perfection with lemon butter reduction.',
      imageUrl:
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Cá hồi Na Uy'], quantityRequired: 0.2 },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.04,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.06,
        },
      ],
    },
    {
      name: 'Gourmet Beef Cheese Burger',
      price: 6.99,
      category: 'Main',
      description:
        'Juicy Australian beef patty topped with melted Cheddar and caramelized onions.',
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bánh mì & Vỏ bánh Burger'],
          quantityRequired: 1.0,
        },
        { inventoryItemId: inv['Thịt bò Úc & Wagyu'], quantityRequired: 0.18 },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.04,
        },
        {
          inventoryItemId: inv['Khoai tây củ & Khoai que'],
          quantityRequired: 0.12,
        },
      ],
    },
    {
      name: 'Premium Seafood Pizza',
      price: 10.49,
      category: 'Main',
      description:
        'Crispy pizza crust topped with shrimp, squid, crab sticks, Mozzarella.',
      imageUrl:
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.15,
        },
        { inventoryItemId: inv['Tôm & Hải sản tươi'], quantityRequired: 0.16 },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Cà chua & Thảo mộc Basil'],
          quantityRequired: 0.06,
        },
      ],
    },
    {
      name: 'Royal Seafood Fried Rice',
      price: 5.29,
      category: 'Main',
      description:
        'Fluffy fried rice with shrimp, squid, salted egg yolk, lotus seeds.',
      imageUrl:
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Gạo thơm & Nếp Thái'], quantityRequired: 0.16 },
        { inventoryItemId: inv['Tôm & Hải sản tươi'], quantityRequired: 0.12 },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Herb-Crusted Grilled Lamb Chops',
      price: 15.99,
      category: 'Main',
      description:
        'Roasted herb-marinated lamb chops served with creamy mashed potatoes.',
      imageUrl:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Sườn cừu tươi'], quantityRequired: 0.28 },
        {
          inventoryItemId: inv['Khoai tây củ & Khoai que'],
          quantityRequired: 0.15,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Chashu Pork Ramen',
      price: 6.49,
      category: 'Main',
      description:
        'Authentic Japanese ramen with bone broth, tender chashu pork, egg.',
      imageUrl:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Mì Pasta & Bánh phở'], quantityRequired: 0.15 },
        { inventoryItemId: inv['Sườn heo & Thịt heo'], quantityRequired: 0.12 },
        { inventoryItemId: inv['Nấm tươi các loại'], quantityRequired: 0.04 },
      ],
    },
    {
      name: 'Chicken Tikka Masala',
      price: 7.49,
      category: 'Main',
      description:
        'Tender chicken pieces cooked in a spiced tomato and cream gravy.',
      imageUrl:
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Thịt gà tươi & Cánh gà'],
          quantityRequired: 0.22,
        },
        {
          inventoryItemId: inv['Cà chua & Thảo mộc Basil'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.06,
        },
        { inventoryItemId: inv['Gạo thơm & Nếp Thái'], quantityRequired: 0.1 },
      ],
    },
    {
      name: 'Grilled Pork BBQ Ribs',
      price: 13.99,
      category: 'Main',
      description:
        'Slow-cooked baby back ribs glazed with smoky hickory BBQ sauce.',
      imageUrl:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Sườn heo & Thịt heo'], quantityRequired: 0.35 },
        {
          inventoryItemId: inv['Khoai tây củ & Khoai que'],
          quantityRequired: 0.15,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.06,
        },
      ],
    },
    {
      name: 'Pad Thai Shrimp',
      price: 6.29,
      category: 'Main',
      description:
        'Traditional stir-fried rice noodles with tiger prawns, tofu, crushed peanuts.',
      imageUrl:
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Mì Pasta & Bánh phở'], quantityRequired: 0.14 },
        { inventoryItemId: inv['Tôm & Hải sản tươi'], quantityRequired: 0.15 },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.06,
        },
      ],
    },
    {
      name: 'Duck Breast with Cherry Sauce',
      price: 14.49,
      category: 'Main',
      description:
        'Pan-roasted duck breast served medium-rare with dark sweet cherry reduction.',
      imageUrl:
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Ức vịt tươi'], quantityRequired: 0.25 },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Mushroom Truffle Risotto',
      price: 8.99,
      category: 'Main',
      description:
        'Creamy Arborio rice slow-cooked with wild mushrooms, parmesan, black truffle.',
      imageUrl:
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Gạo thơm & Nếp Thái'], quantityRequired: 0.14 },
        { inventoryItemId: inv['Nấm Truffle đen tươi'], quantityRequired: 3.0 },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.04,
        },
        { inventoryItemId: inv['Nấm tươi các loại'], quantityRequired: 0.08 },
      ],
    },
    {
      name: 'Traditional Beef Pho',
      price: 5.49,
      category: 'Main',
      description:
        'Aromatic Vietnamese beef noodle soup served with sliced brisket and ribeye.',
      imageUrl:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Mì Pasta & Bánh phở'], quantityRequired: 0.18 },
        { inventoryItemId: inv['Thịt bò Úc & Wagyu'], quantityRequired: 0.16 },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Fish and Chips',
      price: 6.89,
      category: 'Main',
      description:
        'Beer-battered cod fish fillet served with thick-cut fries and tartar sauce.',
      imageUrl:
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Cá tuyết Cod Fillet'], quantityRequired: 0.22 },
        {
          inventoryItemId: inv['Khoai tây củ & Khoai que'],
          quantityRequired: 0.18,
        },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.06,
        },
      ],
    },
    {
      name: 'Mexican Chicken Fajitas',
      price: 7.99,
      category: 'Main',
      description:
        'Sizzling grilled chicken strips with bell peppers, onions, guacamole.',
      imageUrl:
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Thịt gà tươi & Cánh gà'],
          quantityRequired: 0.2,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Bánh mì & Vỏ bánh Burger'],
          quantityRequired: 1.0,
        },
      ],
    },
    {
      name: 'Vegetarian Spinach Lasagna',
      price: 6.49,
      category: 'Main',
      description:
        'Layers of pasta, ricotta cheese, fresh spinach, and marinara sauce.',
      imageUrl:
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Mì Pasta & Bánh phở'], quantityRequired: 0.14 },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.12,
        },
        {
          inventoryItemId: inv['Phô mai Cheddar & Mozzarella'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Cà chua & Thảo mộc Basil'],
          quantityRequired: 0.08,
        },
      ],
    },
    {
      name: 'Korean Beef Bulgogi Bowl',
      price: 6.99,
      category: 'Main',
      description:
        'Marinated sweet soy beef served over steamed rice with kimchi.',
      imageUrl:
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Thịt bò Úc & Wagyu'], quantityRequired: 0.18 },
        { inventoryItemId: inv['Gạo thơm & Nếp Thái'], quantityRequired: 0.16 },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.06,
        },
      ],
    },

    // --- DESSERTS (15 MÓN) ---
    {
      name: 'Traditional Tiramisu',
      price: 2.99,
      category: 'Dessert',
      description:
        'Classic Italian dessert infused with espresso, rum, mascarpone cream.',
      imageUrl:
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Hạt Cà phê Espresso Ý'],
          quantityRequired: 0.015,
        },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Passion Fruit Mousse',
      price: 2.49,
      category: 'Dessert',
      description:
        'Light and creamy passion fruit mousse with a balanced sweet-tangy taste.',
      imageUrl:
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.07,
        },
      ],
    },
    {
      name: 'Strawberry Gelato',
      price: 1.99,
      category: 'Dessert',
      description:
        'Authentic Italian gelato made with real fresh strawberries.',
      imageUrl:
        'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.08,
        },
      ],
    },
    {
      name: 'Molten Chocolate Lava Cake',
      price: 3.29,
      category: 'Dessert',
      description:
        'Warm chocolate cake filled with molten center, served with ice cream.',
      imageUrl:
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.06,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.03,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Blueberry Cheesecake',
      price: 2.99,
      category: 'Dessert',
      description:
        'Rich baked cheesecake layered with sweet blueberry compote.',
      imageUrl:
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.09,
        },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.05,
        },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Crème Brûlée',
      price: 3.19,
      category: 'Dessert',
      description:
        'Rich vanilla bean custard topped with a contrasting layer of caramelized sugar.',
      imageUrl:
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Apple Tart Tatin',
      price: 2.89,
      category: 'Dessert',
      description:
        'Caramelized upside-down apple tart served with cinnamon gelato.',
      imageUrl:
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.12,
        },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.06,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Mango Sticky Rice',
      price: 2.69,
      category: 'Dessert',
      description:
        'Sweet Thai coconut sticky rice served with ripe fresh mango slices.',
      imageUrl:
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Gạo thơm & Nếp Thái'], quantityRequired: 0.15 },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Matcha Green Tea Mille Crepe',
      price: 3.49,
      category: 'Dessert',
      description:
        'Twenty delicate layers of crepes layered with light matcha cream.',
      imageUrl:
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trà đen & Bột Matcha Nhật'],
          quantityRequired: 0.02,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Churros with Dark Chocolate Dip',
      price: 2.59,
      category: 'Dessert',
      description:
        'Golden fried Spanish dough pastries dusted with cinnamon sugar and dip.',
      imageUrl:
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Bơ Pháp & Dầu Olive tỏi'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Panna Cotta Raspberry',
      price: 2.79,
      category: 'Dessert',
      description:
        'Silky smooth Italian cooked cream topped with fresh raspberry coulis.',
      imageUrl:
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.09,
        },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.05,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Key Lime Pie',
      price: 2.89,
      category: 'Dessert',
      description:
        'Tangy and sweet key lime custard in a graham cracker crust.',
      imageUrl:
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Chocolate Macarons (3 pcs)',
      price: 2.29,
      category: 'Dessert',
      description:
        'French almond meringue cookies sandwiched with dark chocolate ganache.',
      imageUrl:
        'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.05,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Banana Foster Waffle',
      price: 3.29,
      category: 'Dessert',
      description:
        'Belgian waffle topped with caramelized bananas and vanilla gelato.',
      imageUrl:
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Red Velvet Cupcake',
      price: 1.99,
      category: 'Dessert',
      description: 'Moist cocoa velvet cake topped with cream cheese frosting.',
      imageUrl:
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Bột Tempura & Chiên giòn'],
          quantityRequired: 0.06,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.04,
        },
      ],
    },

    // --- DRINKS (17 MÓN) ---
    {
      name: 'Iced Berry Matcha',
      price: 2.19,
      category: 'Drink',
      description: 'Japanese matcha green tea layered with sweet berry puree.',
      imageUrl:
        'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trà đen & Bột Matcha Nhật'],
          quantityRequired: 0.015,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.12,
        },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.04,
        },
      ],
    },
    {
      name: 'Caffè Latte',
      price: 1.99,
      category: 'Drink',
      description:
        'Bold Espresso blended with silky steamed milk and delicate foam art.',
      imageUrl:
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Hạt Cà phê Espresso Ý'],
          quantityRequired: 0.02,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.18,
        },
      ],
    },
    {
      name: 'Peach Orange Lemongrass Tea',
      price: 2.09,
      category: 'Drink',
      description:
        'Refreshing black tea brewed with sweet peaches, orange, and lemongrass.',
      imageUrl:
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trà đen & Bột Matcha Nhật'],
          quantityRequired: 0.02,
        },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.06,
        },
      ],
    },
    {
      name: 'Mango Coconut Smoothie',
      price: 2.29,
      category: 'Drink',
      description: 'Blended ripe tropical mangoes with rich coconut cream.',
      imageUrl:
        'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.12,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Classic Mint Mojito',
      price: 3.79,
      category: 'Drink',
      description:
        'Sparkling soda, fresh lime, and crushed mint leaves mocktail.',
      imageUrl:
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.04,
        },
        {
          inventoryItemId: inv['Rau xà lách & Salad xanh'],
          quantityRequired: 0.02,
        },
      ],
    },
    {
      name: 'Iced Americano',
      price: 1.49,
      category: 'Drink',
      description:
        'Double shot of rich espresso poured over cold water and ice.',
      imageUrl:
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Hạt Cà phê Espresso Ý'],
          quantityRequired: 0.022,
        },
      ],
    },
    {
      name: 'Brown Sugar Boba Milk',
      price: 2.49,
      category: 'Drink',
      description:
        'Fresh milk paired with warm brown sugar tapioca pearls and cream foam.',
      imageUrl:
        'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=80',
      recipes: [
        { inventoryItemId: inv['Sữa tươi thanh trùng'], quantityRequired: 0.2 },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Fresh Orange & Passion Fruit Juice',
      price: 2.19,
      category: 'Drink',
      description: 'Freshly squeezed oranges blended with tangy passion fruit.',
      imageUrl:
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.16,
        },
      ],
    },
    {
      name: 'Caramel Macchiato',
      price: 2.39,
      category: 'Drink',
      description:
        'Steamed milk with vanilla syrup, marked with espresso and caramel.',
      imageUrl:
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Hạt Cà phê Espresso Ý'],
          quantityRequired: 0.02,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.16,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.02,
        },
      ],
    },
    {
      name: 'Watermelon Lychee Freeze',
      price: 2.29,
      category: 'Drink',
      description:
        'Blended fresh watermelon slushy topped with sweet lychee fruit.',
      imageUrl:
        'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.15,
        },
      ],
    },
    {
      name: 'Strawberry Basil Lemonade',
      price: 1.99,
      category: 'Drink',
      description:
        'Handcrafted lemonade muddled with fresh strawberries and sweet basil.',
      imageUrl:
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.08,
        },
        {
          inventoryItemId: inv['Cà chua & Thảo mộc Basil'],
          quantityRequired: 0.015,
        },
      ],
    },
    {
      name: 'Pina Colada',
      price: 3.99,
      category: 'Drink',
      description: 'Creamy blend of coconut cream and fresh pineapple juice.',
      imageUrl:
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.1,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.05,
        },
      ],
    },
    {
      name: 'Earl Grey Lavender Milk Tea',
      price: 2.19,
      category: 'Drink',
      description:
        'Fragrant Earl Grey tea steeped with dried lavender buds and milk.',
      imageUrl:
        'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trà đen & Bột Matcha Nhật'],
          quantityRequired: 0.02,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.14,
        },
      ],
    },
    {
      name: 'Hot Chocolate Marshmallow',
      price: 2.09,
      category: 'Drink',
      description:
        'Belgian dark chocolate melted in whole milk, topped with marshmallows.',
      imageUrl:
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.18,
        },
        {
          inventoryItemId: inv['Kem béo Whipping & Mascarpone'],
          quantityRequired: 0.03,
        },
      ],
    },
    {
      name: 'Avocado Honey Smoothie',
      price: 2.49,
      category: 'Drink',
      description:
        'Creamy Hass avocado blended with condensed milk and wild honey.',
      imageUrl:
        'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.14,
        },
        {
          inventoryItemId: inv['Sữa tươi thanh trùng'],
          quantityRequired: 0.08,
        },
      ],
    },
    {
      name: 'Espresso Tonic',
      price: 2.29,
      category: 'Drink',
      description:
        'Single-origin espresso poured over chilled tonic water and citrus.',
      imageUrl:
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Hạt Cà phê Espresso Ý'],
          quantityRequired: 0.02,
        },
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.02,
        },
      ],
    },
    {
      name: 'Sparkling Berry Sangria Mocktail',
      price: 2.69,
      category: 'Drink',
      description:
        'Sparkling grape juice infused with fresh berries and citrus slices.',
      imageUrl:
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      recipes: [
        {
          inventoryItemId: inv['Trái cây tươi & Sốt Puree'],
          quantityRequired: 0.1,
        },
      ],
    },
  ];

  const createdDishesMap: Record<string, any> = {};

  for (const item of menuWithRecipes) {
    const createdDish = await prisma.menuItem.create({
      data: {
        categoryId: catMap[item.category],
        name: item.name,
        price: item.price,
        costPrice: Math.round(item.price * 0.35 * 100) / 100,
        description: item.description,
        imageUrl: item.imageUrl,
        isAvailable: true,
        isRecommendable: item.price > 5.0,
        recipes: {
          create: item.recipes,
        },
      },
    });

    createdDishesMap[item.name] = createdDish;
  }
  console.log(
    `✅ Toàn bộ ${menuWithRecipes.length} món ăn đã được nạp đầy đủ công thức BOM recipes!`,
  );

  // ==========================================
  // 7. TẠO ĐƠN GỌI MÓN (ORDERITEMS) THỰC TẾ
  // ==========================================
  const session1 = await prisma.diningSession.create({
    data: {
      sessionCode: 'SES-TB12-LIVE',
      tableId: createdTables[0].id,
      openedById: waiterMia.id,
      customerCount: 2,
      status: SessionStatus.OPEN,
    },
  });

  await prisma.order.create({
    data: {
      orderCode: '#8492',
      sessionId: session1.id,
      waiterId: waiterMia.id,
      status: OrderStatus.CONFIRMED,
      totalAmount: 35.0,
      orderItems: {
        create: [
          {
            menuItemId:
              createdDishesMap['Pan-Seared Salmon with Lemon Butter Sauce'].id,
            quantity: 2,
            unitPrice: 12.49,
            itemStatus: OrderItemStatus.PENDING,
            notes: 'Crispy skin, sauce on side',
          },
          {
            menuItemId: createdDishesMap['Crispy Shrimp Tempura'].id,
            quantity: 1,
            unitPrice: 3.99,
            itemStatus: OrderItemStatus.COOKING,
          },
          {
            menuItemId: createdDishesMap['Iced Berry Matcha'].id,
            quantity: 2,
            unitPrice: 2.19,
            itemStatus: OrderItemStatus.SERVED,
          },
        ],
      },
    },
  });

  const session2 = await prisma.diningSession.create({
    data: {
      sessionCode: 'SES-TB04-LIVE',
      tableId: createdTables[1].id,
      openedById: waiterMia.id,
      customerCount: 2,
      status: SessionStatus.OPEN,
    },
  });

  await prisma.order.create({
    data: {
      orderCode: '#8493',
      sessionId: session2.id,
      waiterId: waiterMia.id,
      status: OrderStatus.IN_PROGRESS,
      totalAmount: 22.76,
      orderItems: {
        create: [
          {
            menuItemId: createdDishesMap['Mushroom Truffle Risotto'].id,
            quantity: 1,
            unitPrice: 8.99,
            itemStatus: OrderItemStatus.COOKING,
            notes: 'Extra truffle shavings',
          },
          {
            menuItemId: createdDishesMap['Gourmet Beef Cheese Burger'].id,
            quantity: 1,
            unitPrice: 6.99,
            itemStatus: OrderItemStatus.PENDING,
            notes: 'No pickles',
          },
          {
            menuItemId: createdDishesMap['Classic Mint Mojito'].id,
            quantity: 1,
            unitPrice: 3.79,
            itemStatus: OrderItemStatus.SERVED,
          },
          {
            menuItemId: createdDishesMap['Traditional Tiramisu'].id,
            quantity: 1,
            unitPrice: 2.99,
            itemStatus: OrderItemStatus.PENDING,
          },
        ],
      },
    },
  });

  const session3 = await prisma.diningSession.create({
    data: {
      sessionCode: 'SES-TB22-LIVE',
      tableId: createdTables[3].id,
      openedById: waiterMia.id,
      customerCount: 4,
      status: SessionStatus.OPEN,
    },
  });

  await prisma.order.create({
    data: {
      orderCode: '#8490',
      sessionId: session3.id,
      waiterId: waiterMia.id,
      status: OrderStatus.IN_PROGRESS,
      totalAmount: 32.44,
      orderItems: {
        create: [
          {
            menuItemId: createdDishesMap['BBQ Chicken Wings'].id,
            quantity: 2,
            unitPrice: 3.99,
            itemStatus: OrderItemStatus.COOKING,
          },
          {
            menuItemId: createdDishesMap['Traditional Beef Pho'].id,
            quantity: 2,
            unitPrice: 5.49,
            itemStatus: OrderItemStatus.COOKING,
          },
          {
            menuItemId: createdDishesMap['Chashu Pork Ramen'].id,
            quantity: 1,
            unitPrice: 6.49,
            itemStatus: OrderItemStatus.READY,
          },
          {
            menuItemId: createdDishesMap['Blueberry Cheesecake'].id,
            quantity: 1,
            unitPrice: 2.99,
            itemStatus: OrderItemStatus.PENDING,
          },
          {
            menuItemId: createdDishesMap['Caffè Latte'].id,
            quantity: 2,
            unitPrice: 1.99,
            itemStatus: OrderItemStatus.SERVED,
          },
        ],
      },
    },
  });
  console.log('✅ Đã tạo các đơn OrderItems thực tế!');

  // ==========================================
  // 8. ĐƠN NHẬP KHO & THEO DÕI BIẾN ĐỘNG (STOCK MOVEMENT)
  // ==========================================
  const stockReceipt = await prisma.stockReceipt.create({
    data: {
      receiptCode: 'RC-2026-0901',
      managerId: adminUser.id,
      supplierName: 'Artisan Meat Importers Ltd.',
      totalCost: 1200.0,
      details: {
        create: [
          {
            inventoryItemId: inv['Thịt bò Úc & Wagyu'],
            quantity: 10,
            unitPrice: 90.0,
          },
          {
            inventoryItemId: inv['Tôm & Hải sản tươi'],
            quantity: 10,
            unitPrice: 30.0,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      inventoryItemId: inv['Thịt bò Úc & Wagyu'],
      createdById: adminUser.id,
      movementType: StockMovementType.IN_RECEIPT,
      quantity: 10,
      balanceAfter: 35.0,
      note: `Inbound receipt ${stockReceipt.receiptCode}`,
    },
  });

  // ==========================================
  // 9. LỊCH LÀM VIỆC & CHẤM CÔNG
  // ==========================================
  const eveningShift = await prisma.shift.create({
    data: {
      name: 'Evening Dinner Shift',
      startTime: '16:00',
      endTime: '23:30',
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const chefAssignment = await prisma.shiftAssignment.create({
    data: {
      userId: chefUser.id,
      shiftId: eveningShift.id,
      assignedDate: today,
    },
  });

  await prisma.attendance.create({
    data: {
      userId: chefUser.id,
      shiftAssignmentId: chefAssignment.id,
      checkInTime: new Date(new Date().setHours(15, 55, 0, 0)),
      status: AttendanceStatus.ON_TIME,
    },
  });

  // ==========================================
  // 10. PHÂN QUYỀN RBAC (PERMISSIONS & ROLE_PERMISSIONS)
  // ==========================================
  console.log('🔐 Bổ sung danh mục quyền hạn hệ thống (RBAC)...');
  const permissionsData = [
    {
      code: 'DASHBOARD_VIEW',
      name: 'Xem báo cáo Dashboard',
      description: 'Quyền xem thống kê doanh thu và hoạt động',
    },
    {
      code: 'ORDER_CREATE',
      name: 'Tạo đơn gọi món',
      description: 'Nhân viên order/khách hàng tạo đơn',
    },
    {
      code: 'ORDER_UPDATE_STATUS',
      name: 'Cập nhật trạng thái món',
      description: 'Bếp cập nhật trạng thái chế biến',
    },
    {
      code: 'BILL_CREATE',
      name: 'Tạo hóa đơn thanh toán',
      description: 'Thu ngân kết toán hóa đơn',
    },
    {
      code: 'REFUND_APPROVE',
      name: 'Duyệt hoàn tiền',
      description: 'Chỉ dành cho Manager duyệt trả tiền khách',
    },
    {
      code: 'INVENTORY_MANAGE',
      name: 'Quản lý kho',
      description: 'Nhập xuất và kiểm kê kho nguyên liệu',
    },
    {
      code: 'MENU_MANAGE',
      name: 'Quản lý thực đơn',
      description: 'Thêm, sửa giá và công thức món',
    },
  ];

  const createdPerms: Record<string, string> = {};
  for (const p of permissionsData) {
    const perm = await prisma.permission.create({ data: p });
    createdPerms[p.code] = perm.id;
  }

  const managerRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.MANAGER },
  });
  const customerRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.CUSTOMER },
  });

  const rolePermissionsToCreate = [
    ...Object.values(createdPerms).map((permId) => ({
      roleId: adminRole.id,
      permissionId: permId,
    })),
    ...Object.values(createdPerms).map((permId) => ({
      roleId: managerRole.id,
      permissionId: permId,
    })),
    { roleId: cashierRole.id, permissionId: createdPerms['BILL_CREATE'] },
    { roleId: cashierRole.id, permissionId: createdPerms['ORDER_CREATE'] },
    { roleId: chefRole.id, permissionId: createdPerms['ORDER_UPDATE_STATUS'] },
    { roleId: chefRole.id, permissionId: createdPerms['INVENTORY_MANAGE'] },
    { roleId: waiterRole.id, permissionId: createdPerms['ORDER_CREATE'] },
    { roleId: customerRole.id, permissionId: createdPerms['ORDER_CREATE'] },
  ];

  for (const rp of rolePermissionsToCreate) {
    await prisma.rolePermission.create({ data: rp });
  }
  console.log('✅ Đã tạo quyền hạn và cấu hình Role-Permissions!');

  // ==========================================
  // 11. REFRESH TOKEN (MẪU PHIÊN ĐĂNG NHẬP)
  // ==========================================
  await prisma.refreshToken.create({
    data: {
      userId: adminUser.id,
      tokenHash: 'sample_hashed_jwt_token_admin_device_001',
      deviceInfo: 'Chrome on macOS Sonoma (Desktop POS)',
      ipAddress: '192.168.1.50',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // ==========================================
  // 12. KHÁCH HÀNG & ĐẶT BÀN TRƯỚC (RESERVATIONS)
  // ==========================================
  const customerUser = await prisma.user.create({
    data: {
      phone: '0912345678',
      fullName: 'Johnathan Wick',
      email: 'john.wick@continental.com',
      passwordHash: defaultPasswordHash,
      roleId: customerRole.id,
      isActive: true,
    },
  });

  const reservationTime = new Date();
  reservationTime.setHours(reservationTime.getHours() + 4);

  await prisma.reservation.create({
    data: {
      customerId: customerUser.id,
      guestName: 'Johnathan Wick',
      guestPhone: '0912345678',
      partySize: 6,
      tableId: createdTables[2].id, // Table 8
      reservationTime: reservationTime,
      depositAmount: 50.0,
      depositStatus: DepositStatus.PAID,
      status: ReservationStatus.CONFIRMED,
      specialRequest:
        'Corner table with quiet ambient lighting, wine glasses ready.',
    },
  });
  console.log('✅ Đã tạo Customer mẫu và đơn đặt bàn (Reservation)!');

  // ==========================================
  // 13. KHUYẾN MÃI (PROMOTIONS)
  // ==========================================
  const promoStartDate = new Date();
  promoStartDate.setDate(promoStartDate.getDate() - 5);
  const promoEndDate = new Date();
  promoEndDate.setDate(promoEndDate.getDate() + 25);

  const promoAutumn = await prisma.promotion.create({
    data: {
      code: 'AUTUMN2026',
      description: 'Giảm 10% tổng bill cho tiệc tối mùa thu',
      discountPercent: 10.0,
      minOrderAmount: 30.0,
      maxDiscount: 15.0,
      startDate: promoStartDate,
      endDate: promoEndDate,
      isActive: true,
    },
  });

  // ==========================================
  // 14. PHIÊN THANH TOÁN HOÀN TẤT: BILL, PAYMENT & REFUND
  // ==========================================
  const sessionClosed = await prisma.diningSession.create({
    data: {
      sessionCode: 'SES-BAR03-COMPLETED',
      tableId: createdTables[4].id, // BAR 3
      openedById: waiterMia.id,
      closedById: cashierElena.id,
      customerCount: 1,
      status: SessionStatus.CLOSED,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 45 * 60 * 1000),
    },
  });

  await prisma.order.create({
    data: {
      orderCode: '#8480',
      sessionId: sessionClosed.id,
      waiterId: waiterMia.id,
      status: OrderStatus.COMPLETED,
      totalAmount: 59.78,
      orderItems: {
        create: [
          {
            menuItemId: createdDishesMap['Beef Tataki'].id,
            quantity: 1,
            unitPrice: 55.99,
            itemStatus: OrderItemStatus.SERVED,
          },
          {
            menuItemId: createdDishesMap['Classic Mint Mojito'].id,
            quantity: 1,
            unitPrice: 3.79,
            itemStatus: OrderItemStatus.SERVED,
          },
        ],
      },
    },
  });

  const subtotal = 59.78;
  const discount = Math.round(subtotal * 0.1 * 100) / 100;
  const finalTotal = subtotal - discount;

  const billClosed = await prisma.bill.create({
    data: {
      billCode: 'BILL-2026-008480',
      sessionId: sessionClosed.id,
      cashierId: cashierElena.id,
      promotionId: promoAutumn.id,
      subtotalAmount: subtotal,
      discountAmount: discount,
      finalAmount: finalTotal,
      status: BillStatus.PAID,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      billId: billClosed.id,
      cashierId: cashierElena.id,
      paymentMethod: PaymentMethod.VNPAY,
      amountPaid: 53.8,
      changeAmount: 0.0,
      transactionCode: 'VNPAY_TXN_987654321_OK',
      status: PaymentStatus.SUCCESS,
    },
  });

  await prisma.refund.create({
    data: {
      paymentId: payment.id,
      managerId: adminUser.id,
      amount: 3.79,
      reason:
        'Khách đổi ý mocktail trước giờ pha chế, thu ngân hoàn trả qua cổng ví',
    },
  });
  console.log('✅ Đã tạo Bill, Payment và Refund mẫu!');

  // ==========================================
  // 15. NHẬT KÝ KIỂM TOÁN (AUDIT LOGS)
  // ==========================================
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'UPDATE_MENU_PRICE',
        entityName: 'MenuItem',
        entityId: createdDishesMap['Beef Tataki'].id,
        oldValues: { name: 'Beef Tataki', price: 49.99 },
        newValues: { name: 'Beef Tataki', price: 55.99 },
        ipAddress: '192.168.1.10',
      },
      {
        userId: cashierElena.id,
        action: 'APPLY_PROMOTION',
        entityName: 'Bill',
        entityId: billClosed.id,
        oldValues: { discountAmount: 0.0, finalAmount: 59.78 },
        newValues: {
          promotionCode: 'AUTUMN2026',
          discountAmount: 5.98,
          finalAmount: 53.8,
        },
        ipAddress: '192.168.1.25',
      },
      {
        userId: adminUser.id,
        action: 'PROCESS_REFUND',
        entityName: 'Payment',
        entityId: payment.id,
        newValues: { refundedAmount: 3.79, reason: 'Refund mocktail' },
        ipAddress: '192.168.1.10',
      },
    ],
  });
  console.log('✅ Đã ghi nhận lịch sử Audit Logs kiểm toán hệ thống!');

  console.log(
    '🎉 Database seeding hoàn tất 100%! Toàn bộ bảng đã có đầy đủ dữ liệu quan hệ hoàn chỉnh!',
  );
}

main()
  .catch((error) => {
    console.error('❌ Database seeding thất bại:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
